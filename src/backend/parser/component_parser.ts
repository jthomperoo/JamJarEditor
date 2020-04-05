import ts from "typescript";
import path from "path";
import FileIO from "../file_io/file_io";
import IFileIO from "../file_io/ifile_io";
import ComponentSpec from "../../shared/component_spec";
import Property from "../../shared/property";
import Value from "../../shared/value";

class ComponentParser {
    private static readonly COMPONENT_CLASS_PATH = "jamjar/lib/component/component";
    
    private fileIO: IFileIO;
    constructor(fileIO: IFileIO = new FileIO()) {
        this.fileIO = fileIO;
    }

    public Parse(filePath: string, projectPath: string): ComponentSpec {
        const sourceCode = this.fileIO.ReadFileSync(filePath);
        const source = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.ES5);
        const componentClassName = this.getComponentClassName(source, filePath);

        if (componentClassName === undefined) {
            throw(`Class exported from '${filePath}' is not a valid component`);
        }
        const properties = this.generateProperties(source, componentClassName, filePath);

        if (properties === undefined) {
            throw(`Error extracting properties from component '${componentClassName}' in file '${filePath}'`);
        }

        let importPath = this.convertPathToImportPath(filePath);
        return new ComponentSpec(
            componentClassName,
            importPath,
            properties
        );
    }

    private getComponentClassName(source: ts.SourceFile, filePath: string): string | undefined {
        let exportedComponentName: string | undefined = undefined;
        ts.forEachChild(source, (node: ts.Node) => {
            if (!ts.isExportAssignment(node)) {
                return;
            }
            ts.forEachChild(node, (child: ts.Node) => {
                if (!ts.isIdentifier(child)) {
                    return;
                }
                exportedComponentName = child.escapedText.toString();
            });
        });
    
        if (exportedComponentName === undefined) {
            throw(`No component found exported from source file ${filePath}`);
        }
    
        const imports = this.getFileImports(source);
    
        let componentClass: ts.ClassDeclaration | undefined = undefined;
        ts.forEachChild(source, (classDec: ts.Node) => {
            if (!ts.isClassDeclaration(classDec)) {
                return
            }
            if (exportedComponentName === undefined) {
                throw(`No component found exported from source file ${filePath}`);
            }
            if (this.extendsComponent(source, classDec, exportedComponentName, imports, filePath)) {
                componentClass = classDec;
            }
        });
        if (componentClass === undefined) {
            return;
        }
        return this.getNameFromClass(componentClass);
    }
    
    private extendsComponent(source: ts.SourceFile, classDec: ts.ClassDeclaration, className: string, imports: Map<string, string>, filePath: string): boolean {
        let classFound = false;
        ts.forEachChild(classDec, (identifier: ts.Node) => {
            if (!ts.isIdentifier(identifier)) {
                return;
            }
            if (className === identifier.escapedText.toString()) {
                classFound = true;
            }
        });
        if (!classFound) {
            return false;
        }
    
        const inheritors: string[] = this.getClassInheritors(classDec);
    
        for (const inheritor of inheritors) {
            let extend = false;
            const inheritorImport = imports.get(inheritor);
            if (inheritorImport === undefined) {
                // Must be defined in file
                ts.forEachChild(source, (inheritorClassDec: ts.Node) => {
                    if (!ts.isClassDeclaration(inheritorClassDec)) {
                        return;
                    }
                    if (classDec === inheritorClassDec) {
                        return;
                    }
                    if (extend) {
                        return;
                    }
                    let inheritorName: string | undefined = undefined;
                    ts.forEachChild(inheritorClassDec, (inheritorClassIdentifier: ts.Node) => {
                        if (!ts.isIdentifier(inheritorClassIdentifier)) {
                            return;
                        }
                        inheritorName = inheritorClassIdentifier.escapedText.toString();
                    });
                    if (inheritorName === undefined) {
                        throw("No identifier for inheritance class");
                    }
                    extend = this.extendsComponent(source, inheritorClassDec, inheritorName, imports, filePath);
                });
            } else {
                if (path.resolve(path.dirname(filePath), inheritorImport).includes(ComponentParser.COMPONENT_CLASS_PATH)) {
                    extend = true;
                } else {
                    // Defined outside of file
                    const outsideFileSourceCode = this.fileIO.ReadFileSync(path.join(path.dirname(filePath), `${inheritorImport}.ts`));
                    const outsideFileSource = ts.createSourceFile(filePath, outsideFileSourceCode, ts.ScriptTarget.ES5);
                    const componentClass = this.getComponentClassName(outsideFileSource, filePath);
                    if (componentClass !== undefined) {
                        extend = true;
                    }
                }
            }
            if (extend) {
                // Valid component
                return true
            }
        }
        return false;
    }

    private getFileImports(source: ts.SourceFile): Map<string, string> {
        const imports: Map<string, string> = new Map();
        ts.forEachChild(source, (node: ts.Node) => {
            if (!ts.isImportDeclaration(node)) {
                return;
            }
            let path: string | undefined = undefined;
            ts.forEachChild(node, (child: ts.Node) => {
                if (!ts.isStringLiteral(child)) {
                    return;
                }
                path = child.text;
            });
            if (path === undefined) {
                throw(`Invalid import path`)
            }
            ts.forEachChild(node, (child: ts.Node) => {
                if (!ts.isImportClause(child)) {
                    return;
                }
                ts.forEachChild(child, (child: ts.Node) => {
                    if (!ts.isIdentifier(child)) {
                        return;
                    }
                    if (path === undefined) {
                        throw(`Invalid import path`)
                    }
                    imports.set(child.text, path);
                });
            });
        });
        return imports;
    }
    
    private getClassInheritors(classDec: ts.ClassDeclaration): string[] {
        const inheritors: string[] = [];
        ts.forEachChild(classDec, (heritageClause) => {
            if (!ts.isHeritageClause(heritageClause)) {
                return;
            }
            ts.forEachChild(heritageClause, (typeExpression) => {
                if (!ts.isExpressionWithTypeArguments(typeExpression)) {
                    return;
                }
                ts.forEachChild(typeExpression, (identifier) => {
                    if (!ts.isIdentifier(identifier)) {
                        return;
                    }
                    inheritors.push(identifier.text);
                });
            })
        });
        return inheritors;
    }

    private getClassConstructor(source: ts.SourceFile, className: string, filePath: string): [ts.ConstructorDeclaration, string] | undefined {
        let constructorDec: ts.ConstructorDeclaration | undefined = undefined;
        let constructorFilePath: string = "";
        const imports = this.getFileImports(source);
    
        ts.forEachChild(source, (classDec: ts.Node) => {
            if (!ts.isClassDeclaration(classDec)) {
                return;
            }
            if (!(this.getNameFromClass(classDec) === className)) {
                return;
            }
            ts.forEachChild(classDec, (constructDec) => {
                if (!ts.isConstructorDeclaration(constructDec)) {
                    return;
                }
                constructorDec = constructDec;
                constructorFilePath = filePath;
            });
            if (constructorDec !== undefined) {
                return;
            }
            const inheritors = this.getClassInheritors(classDec);
            for (const inheritor of inheritors) {
                if (constructorDec !== undefined) {
                    return;
                }
                const inheritorPath: string | undefined = imports.get(inheritor);
                if (inheritorPath === undefined) {
                    // Defined in file
                    let classConstructorResult = this.getClassConstructor(source, inheritor, filePath);
                    if (classConstructorResult === undefined) {
                        continue;
                    }
                    constructorDec = classConstructorResult[0];
                    constructorFilePath = classConstructorResult[1];
                    continue;
                } 
                // Defined outside of file
                let outsideFilePath = path.join(path.dirname(filePath), `${inheritorPath}.ts`);
                if (!this.fileIO.ExistsSync(outsideFilePath)) {
                    outsideFilePath = path.join(path.dirname(filePath), `${inheritorPath}.d.ts`);
                }
                const outsideFileSourceCode = this.fileIO.ReadFileSync(outsideFilePath);
                const outsideFileSource = ts.createSourceFile(filePath, outsideFileSourceCode, ts.ScriptTarget.ES5);
                let classConstructorResult = this.getClassConstructor(outsideFileSource, inheritor, outsideFilePath);
                if (classConstructorResult === undefined) {
                    continue;
                }
                constructorDec = classConstructorResult[0];
                constructorFilePath = classConstructorResult[1];
            }
        });
    
        if (constructorDec === undefined) {
            return;
        }
    
        return [constructorDec, constructorFilePath];
    }
    
    private getNameFromClass(classDec: ts.ClassDeclaration): string {
        let componentClassName: string | undefined = "";
        ts.forEachChild(classDec, (identifier) => {
            if (!ts.isIdentifier(identifier)) {
                return;
            }
            componentClassName = identifier.text;
        })
    
        if (componentClassName === undefined) {
            throw(`Unable to extract class name from class defintion`);
        }
        return componentClassName;
    }
    
    private generateProperties(source: ts.SourceFile, className: string, filePath: string): Property[] | undefined {
        const componentConstructorResult = this.getClassConstructor(source, className, filePath);
        if (componentConstructorResult === undefined) {
            return;
        }
        const constructorDec = componentConstructorResult[0];
        const constructorFilePath = componentConstructorResult[1];
        const imports = this.getFileImports(source);
        return this.generatePropertiesForConstructor(source, constructorDec, constructorFilePath, imports);
    }
    
    private generatePropertiesForConstructor(source: ts.SourceFile, constructorDec: ts.ConstructorDeclaration, filePath: string, imports: Map<string, string>): Property[] {
        const properties: Property[] = [];
        ts.forEachChild(constructorDec, (parameterDec) => {
            if (!ts.isParameter(parameterDec)) {
                return;
            }
            properties.push(this.generatePropertyFromParameter(source, parameterDec, filePath, imports));
        })
        return properties;
    }
    
    private generatePropertyFromParameter(source: ts.SourceFile, parameterDec: ts.ParameterDeclaration, filePath: string, imports: Map<string, string>): Property {
        let name: string | undefined = undefined;
        ts.forEachChild(parameterDec, (identifier) => {
            if (!ts.isIdentifier(identifier)) {
                return;
            }
            name = identifier.text;
        });
        if (name === undefined) {
            throw(`Invalid parameter name inside component constructor from ${filePath}`);
        }
        let optional = false;
        let value: Value | undefined = undefined;
        ts.forEachChild(parameterDec, (typeDec) => {
            if (typeDec.kind === ts.SyntaxKind.QuestionToken) {
                optional = true;
            }
            if (typeDec.kind === ts.SyntaxKind.NumberKeyword) {
                // Number
                value = new Value("number", 0, undefined);
                return;
            }
            if (typeDec.kind === ts.SyntaxKind.StringKeyword) {
                // String
                value = new Value("string", "", undefined);
                return;
            }
            if (typeDec.kind === ts.SyntaxKind.BooleanKeyword) {
                // Boolean
                value = new Value("boolean", true, undefined);
                return;
            }
            if (ts.isTypeReferenceNode(typeDec)) {
                let paramTypeClassName: string | undefined = "";
                ts.forEachChild(typeDec, (identifier) => {
                    if (!ts.isIdentifier(identifier)) {
                        return;
                    }
                    paramTypeClassName = identifier.text;
                })
                if (paramTypeClassName === undefined) {
                    throw(`Unable to parameter type name from constructor in '${filePath}'`);
                }
    
                const typePath: string | undefined = imports.get(paramTypeClassName);
                if (typePath === undefined) {
                    const properties = this.generateProperties(source, paramTypeClassName, filePath);
                    if (properties === undefined) {
                        // Built in type
                    } else {
                        value = new Value(paramTypeClassName, properties, filePath);
                    }
                    return;
                } else {
                    // Out of class
                    let outsideFilePath = path.join(path.dirname(filePath), `${typePath}.ts`);
                    if (!this.fileIO.ExistsSync(outsideFilePath)) {
                        outsideFilePath = path.join(path.dirname(filePath), `${typePath}.d.ts`);
                    }
                    const outsideFileSourceCode = this.fileIO.ReadFileSync(outsideFilePath);
                    const outsideFileSource = ts.createSourceFile(filePath, outsideFileSourceCode, ts.ScriptTarget.ES5);
                    const properties = this.generateProperties(outsideFileSource, paramTypeClassName, outsideFilePath);
                    if (properties === undefined) {
                        throw(`Type '${paramTypeClassName}' not found in path '${outsideFilePath}'`);
                    }
                    let importPath = this.convertPathToImportPath(outsideFilePath);
                    value = new Value(paramTypeClassName, properties, importPath);
                    return;
                }
            }
        })
        if (value === undefined) {
            throw(`Invalid parameter value inside component constructor from ${filePath}`);
        }
        return new Property(name, optional, false, value);
    }
    
    private convertPathToImportPath(filePath: string): string {
        let importPath: string = filePath;
        if (importPath.includes("node_modules/")) {
            const importPathPosition = importPath.lastIndexOf("node_modules/") + "node_modules/".length;
            importPath = importPath.substring(importPathPosition, importPath.length);
        }
        if (importPath.endsWith(".d.ts")) {
            importPath = importPath.substring(0, importPath.length - ".d.ts".length);
        }
        if (importPath.endsWith(".ts")) {
            importPath = importPath.substring(0, importPath.length - ".ts".length);
        }
        return importPath;
    }
}

export default ComponentParser;