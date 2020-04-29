/*
Copyright 2020 JamJar Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import ts from "typescript";
import path from "path";
import Entity from "../../shared/data/entity";
import Property from "../../shared/data/property";
import Value from "../../shared/data/value";
import Component from "../../shared/data/component";
import ValueList from "../../shared/data/value_list";
import ComponentSpec from "../../shared/data/component_spec";
import ISceneWriter from "./iscene_writer";
import Scene from "../../shared/data/scene";
import IFileIO from "../file_io/ifile_io";
import FileIO from "../file_io/file_io";

class SceneWriter implements ISceneWriter{
    private static readonly LOAD_ENTITIES_METHOD_NAME = "loadEditorEntities";
    private static readonly ENTITY_IDENTIFIER = "Entity";
    private static readonly ENTITY_IMPORT_PATH = "jamjar/lib/entity/entity"

    private fileIO: IFileIO;
    private printer: ts.Printer;

    constructor(fileIO: IFileIO = new FileIO(), printer: ts.Printer = ts.createPrinter()) {
        this.fileIO = fileIO;
        this.printer = printer;
    }

    public Write(filePath: string, scene: Scene, specs: ComponentSpec[]): void {
        const specMap: Map<number, ComponentSpec> = new Map();
        for (const spec of specs) {
            specMap.set(spec.id, spec);
        }
        this.fileIO.ReadFile(filePath)
            .then((data) => {
                const sourceText = data.toString("utf8");
                const source = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.ES5);
                const loadEntitiesMethod = this.generateEntityMethod(specMap, scene.entities);
                const importDeclarations = this.generateImports(filePath, source, specMap, scene.entities);
                const sceneClass = this.extractSceneClass(source);
                const modifiedClass = this.generateSceneClass(sceneClass, loadEntitiesMethod);
                const modifiedSource = this.removeUnusedImports(this.generateSource(source, modifiedClass, importDeclarations));
                const modifiedSourceText = this.printer.printNode(ts.EmitHint.Unspecified, modifiedSource, modifiedSource);
                this.fileIO.WriteFile(filePath, modifiedSourceText);
            });
    }

    private generateSource(source: ts.SourceFile, sceneClass: ts.ClassDeclaration, importDeclarations: ts.ImportDeclaration[]): ts.SourceFile {
        const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T): T => {
            function updateEntityMethod(node: ts.Node): ts.Node {
                if (ts.isClassDeclaration(node)) {
                    if (node.name === undefined) {
                        return node;
                    }
                    if (sceneClass.name === undefined) {
                        return node;
                    }
                    if (node.name.escapedText !== sceneClass.name.escapedText) {
                        return node;
                    }
                    return sceneClass;
                }
                return node;
            }
            return ts.visitEachChild(rootNode, updateEntityMethod, context);
        };
        
        const result = ts.transform(
            source, [transformer]
        );
        if (result.transformed.length !== 1) {
            throw(`Unexpected number of transformed values, expected: 1, got: ${result.transformed.length}`);
        }
        const transformedNode = result.transformed[0];
        if (!ts.isSourceFile(transformedNode)) {
            throw (`Unexpected transformed value type, expected: SourceFile, got: ${transformedNode}`);
        }
        return ts.updateSourceFileNode(transformedNode, [
            ...importDeclarations,
            ...transformedNode.statements
        ]);
    }

    private generateSceneClass(sceneClass: ts.ClassDeclaration, loadEntitiesMethod: ts.MethodDeclaration): ts.ClassDeclaration {
        const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T): T => {
            function updateEntityMethod(node: ts.Node): ts.Node {
                if (ts.isMethodDeclaration(node)) {
                    const name = node.name;
                    if (!ts.isIdentifier(name)) {
                        return node;
                    }
                    if (name.escapedText !== "loadEditorEntities") {
                        return node;
                    }
                    return loadEntitiesMethod;
                }
                return node;
            }
            return ts.visitEachChild(rootNode, updateEntityMethod, context);
        };
        
        const result = ts.transform(
            sceneClass, [transformer]
        );
        if (result.transformed.length !== 1) {
            throw(`Unexpected number of transformed values, expected: 1, got: ${result.transformed.length}`);
        }
        const transformedNode = result.transformed[0];
        if (!ts.isClassDeclaration(transformedNode)) {
            throw (`Unexpected transformed value type, expected: ClassDefinition, got: ${transformedNode}`);
        }
        return transformedNode;
    }

    private generateImports(filePath: string, source: ts.SourceFile, specs: Map<number, ComponentSpec>, entities: Entity[]): ts.ImportDeclaration[] {
        const existingImports = this.extractExistingImports(source);
        const generatedImports: ts.ImportDeclaration[] = [];
        if (!existingImports.includes(SceneWriter.ENTITY_IDENTIFIER)) {
            generatedImports.push(ts.createImportDeclaration(
                undefined,
                undefined,
                ts.createImportClause(
                    ts.createIdentifier(
                        SceneWriter.ENTITY_IDENTIFIER
                    ),
                    undefined,
                    undefined
                ),
                ts.createStringLiteral(
                    SceneWriter.ENTITY_IMPORT_PATH
                )
            ));
        }
        generatedImports.push(...this.generateComponentImports(filePath, specs, entities, existingImports));
        generatedImports.push(...this.generateValueImports(filePath, entities, existingImports));
        return generatedImports;
    }

    private generateValueImports(filePath: string, entities: Entity[], existingImports: string[]): ts.ImportDeclaration[] {
        const valueImports: ts.ImportDeclaration[] = [];
        const importedValues: Value[] = [];
        for (const entity of entities) {
            for (const component of entity.components) {
                for (const property of component.properties) {
                    if (property.optional && !property.provided) {
                        continue;
                    }
                    importedValues.push(...this.getImportedValuesByValue(property.value));
                }
            }
        }
        const filteredImports: Value[] = [];
        for (const value of importedValues) {
            let alreadyImported = false;
            let i = 0;
            while (!alreadyImported && i < filteredImports.length) {
                const filteredImport = filteredImports[i];
                if (filteredImport.path === value.path) {
                    alreadyImported = true;
                }
                i++;
            }
            if (alreadyImported) {
                continue;
            }
            filteredImports.push(value.Copy());
        }
        for (const filteredImport of filteredImports) {
            if (filteredImport.path === undefined) {
                continue;
            }
            if (existingImports.includes(filteredImport.type)) {
                continue;
            }
            let importPath = filteredImport.path;
            if (importPath.startsWith("/")) {
                // Local import
                importPath = path.relative(path.dirname(filePath), importPath);
                if (!importPath.startsWith(".")) {
                    importPath = `./${importPath}`;
                }
            }
            valueImports.push(ts.createImportDeclaration(
                undefined,
                undefined,
                ts.createImportClause(
                    ts.createIdentifier(
                        filteredImport.type
                    ),
                    undefined,
                    undefined
                ),
                ts.createStringLiteral(
                    importPath
                )
            ));
        }
        return valueImports;
    }

    private getImportedValuesByValue(value: Value): Value[] {
        const imported: Value[] = [];
        if (value.path !== undefined) {
            imported.push(value.Copy());
        }
        if (value.value instanceof Array) {
            const properties = value.value as Property[];
            for (const property of properties) {
                if (property.optional && !property.provided) {
                    continue;
                }
                imported.push(...this.getImportedValuesByValue(property.value));
            }
        }
        if (value.value instanceof ValueList) {
            const items = value.value.items;
            for (const item of items) {
                imported.push(...this.getImportedValuesByValue(item));
            }
        }
        return imported;
    }

    private generateComponentImports(filePath: string, 
        specs: Map<number, ComponentSpec>, 
        entities: Entity[], 
        existingImports: string[]): ts.ImportDeclaration[] {
        const componentImports: ts.ImportDeclaration[] = [];
        const components: Component[] = [];
        for (const entity of entities) {
            for (const component of entity.components) {
                components.push(component);
            }
        }
        const filteredComponents: Component[] = [];
        for (const component of components) {
            const componentSpec = specs.get(component.specID);
            if (componentSpec === undefined) {
                throw(`Using component without a spec; ${component}`);
            }
            let alreadyImported = false;
            let i = 0;
            while (!alreadyImported && i < filteredComponents.length) {
                const filteredImport = filteredComponents[i];
                const filteredSpec = specs.get(filteredImport.specID);
                if (filteredSpec === undefined) {
                    throw(`Using component without a spec; ${filteredImport}`);
                }
                if (filteredSpec.path === componentSpec.path && componentSpec.name === filteredSpec.name) {
                    alreadyImported = true;
                }
                i++;
            }
            if (alreadyImported) {
                continue;
            }
            filteredComponents.push(component.Copy());
        }
        for (const component of filteredComponents) {
            const componentSpec = specs.get(component.specID);
            if (componentSpec === undefined) {
                throw(`Using component without a spec; ${component}`);
            }
            if (existingImports.includes(componentSpec.name)) {
                continue;
            }
            let importPath = componentSpec.path;
            if (importPath.startsWith("/")) {
                // Local import
                importPath = path.relative(path.dirname(filePath), importPath);
                if (!importPath.startsWith(".")) {
                    importPath = `./${importPath}`;
                }
            }
            componentImports.push(ts.createImportDeclaration(
                undefined,
                undefined,
                ts.createImportClause(
                    ts.createIdentifier(
                        componentSpec.name
                    ),
                    undefined,
                    undefined
                ),
                ts.createStringLiteral(
                    importPath
                )
            ));
        }
        return componentImports;
    }

    private extractExistingImports(source: ts.SourceFile): string[] {
        const imports: string[] = [];
        ts.forEachChild(source, (node) => {
            if (!ts.isImportDeclaration(node)) {
                return;
            }
            ts.forEachChild(node, (child) => {
                if (!ts.isImportClause(child)) {
                    return;
                }
                ts.forEachChild(child, (identifier) => {
                    if (!ts.isIdentifier(identifier)) {
                        return;
                    }
                    imports.push(identifier.escapedText.toString());
                });
            });
        });
        return imports;
    }

    private generateEntityMethod(specs: Map<number, ComponentSpec>, entities: Entity[]): ts.MethodDeclaration {
        const statements: ts.Statement[] = [];
        const entityNames: Map<string, number> = new Map();
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            let entityName = `${entity.name}`;
            const entityNameCount = entityNames.get(entityName);
            if (entityNameCount === undefined) {
                entityNames.set(entityName, 0);
            } else {
                entityNames.set(entityName, entityNameCount + 1);
                entityName = `${entityName}${entityNameCount}`;
            }
            const entityStatements = ts.createVariableStatement(undefined, ts.createVariableDeclarationList([
                ts.createVariableDeclaration(
                    ts.createIdentifier(entityName),
                    ts.createTypeReferenceNode("Entity", []),
                    ts.createNew(ts.createIdentifier("Entity"), undefined, [ts.createIdentifier("this.messageBus")])
                )
            ], ts.NodeFlags.Const));
            if (i === 0) {
                ts.addSyntheticLeadingComment(entityStatements, ts.SyntaxKind.MultiLineCommentTrivia, "Code generated by JamJar Editor; DO NOT EDIT.", true);
                ts.addSyntheticLeadingComment(entityStatements, ts.SyntaxKind.MultiLineCommentTrivia, "eslint-disable", true);
            }
            ts.addSyntheticLeadingComment(entityStatements, ts.SyntaxKind.MultiLineCommentTrivia, `EntityName:${entityName}`, true);
            statements.push(entityStatements);
            for (const component of entity.components) {
                const componentSpec = specs.get(component.specID);
                if (componentSpec === undefined) {
                    throw(`Using component without a spec; ${component}`);
                }
                const params: ts.Expression[] = this.generatePropertyIdentifiers(component.properties);
                const addComponent = ts.createExpressionStatement(
                    ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier(entityName),
                            ts.createIdentifier("Add")
                        ),
                        [],
                        [ts.createNew(
                            ts.createIdentifier(componentSpec.name),
                            undefined,
                            params
                        )]
                    )
                );
                statements.push(addComponent);
            }
            statements.push(ts.createExpressionStatement(ts.createCall(
                ts.createPropertyAccess(
                    ts.createThis(),
                    ts.createIdentifier("AddEntity")
                ),
                undefined,
                [ts.createIdentifier(entityName)]
            )));
        }
        return ts.createMethod(
            undefined,
            [ts.createModifier(ts.SyntaxKind.PrivateKeyword)],
            undefined,
            ts.createIdentifier(SceneWriter.LOAD_ENTITIES_METHOD_NAME),
            undefined,
            undefined,
            [],
            ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            ts.createBlock(statements, true)
        );
    }

    private generatePropertyIdentifiers(properties: Property[]): ts.Expression[] {
        const expressions: ts.Expression[] = [];
        for (const property of properties) {
            const value = property.value;
            if (property.optional && !property.provided) {
                expressions.push(ts.createIdentifier("undefined"));
                continue;
            }
            expressions.push(this.generateValueExpression(property.name, value));
        }
        return expressions;
    }
    
    private generateValueExpression(name: string, value: Value): ts.Expression {
        switch (value.type) {
            case "number": {
                if (typeof value.value !== "number") {
                    throw (`Invalid property ${name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                return ts.createNumericLiteral(value.value.toString());
            }
            case "string": {
                if (typeof value.value !== "string") {
                    throw (`Invalid property ${name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                return ts.createStringLiteral(value.value);
            }
            case "boolean": {
                if (typeof value.value !== "boolean") {
                    throw (`Invalid property ${name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                if (value.value === true) {
                    return ts.createTrue();
                }
                return ts.createFalse();
            }
            case "array": {
                if (!(value.value instanceof ValueList)) {
                    throw (`Invalid property ${name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const arrItems: ts.Expression[] = [];
                for (const item of value.value.items) {
                    arrItems.push(this.generateValueExpression(name, item));
                }
                return ts.createArrayLiteral(
                    arrItems,
                    undefined
                );
            }
            default: {
                if (!(value.value instanceof Array)) {
                    throw (`Invalid property ${name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const propertyExpressions = this.generatePropertyIdentifiers(value.value as Property[]);
                return ts.createNew(
                    ts.createIdentifier(value.type),
                    undefined,
                    propertyExpressions
                );
            }
        }
    }

    private removeUnusedImports(source: ts.SourceFile): ts.SourceFile {
        const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T): T => {
            const updateEntityMethod = (node: ts.Node): ts.Node | undefined => {
                if (!ts.isImportDeclaration(node)) {
                    return node;
                }

                let importPath = "";
                ts.forEachChild(node, (stringLiteral) => {
                    if (!ts.isStringLiteral(stringLiteral)) {
                        return;
                    }
                    importPath = stringLiteral.text;
                });

                let defaultImport: ts.Identifier | undefined = undefined;
                const namedImports: ts.Identifier[] = [];
                ts.forEachChild(node, (importClause) => {
                    if (!ts.isImportClause(importClause)) {
                        return;
                    }
                    ts.forEachChild(importClause, (importIdentifier) => {
                        if (ts.isIdentifier(importIdentifier)) {
                            defaultImport = importIdentifier;
                            return;
                        }
                        if (ts.isNamedImports(importIdentifier)) {
                            ts.forEachChild(importIdentifier, (importSpecifier) => {
                                if (!ts.isImportSpecifier(importSpecifier)) {
                                    return;
                                }
                                ts.forEachChild(importSpecifier, (identifier) => {
                                    if (!ts.isIdentifier(identifier)) {
                                        return;
                                    }
                                    namedImports.push(identifier);
                                });
                            });
                        }
                    });
                });

                let defaultUsed = false;
                const usedNamedImports: ts.ImportSpecifier[] = [];

                if (defaultImport !== undefined) {
                    defaultUsed = this.identifierUsed(defaultImport, source);
                }

                for (const namedImport of namedImports) {
                    if (this.identifierUsed(namedImport, source)) {
                        usedNamedImports.push(ts.createImportSpecifier(undefined, namedImport));
                    }
                }

                if (!defaultUsed && usedNamedImports.length === 0) {
                    return undefined;
                }

                if (!defaultUsed) {
                    defaultImport = undefined;
                }

                let namedImportsStatement: ts.NamedImports | undefined = undefined;

                if (usedNamedImports.length > 0) {
                    namedImportsStatement = ts.createNamedImports(
                        usedNamedImports
                    );
                }

                return ts.createImportDeclaration(
                    undefined,
                    undefined,
                    ts.createImportClause(
                        defaultImport,
                        namedImportsStatement,
                        false
                    ),
                    ts.createStringLiteral(importPath)
                );
            };
            return ts.visitEachChild(rootNode, updateEntityMethod, context);
        };
        
        const result = ts.transform(
            source, [transformer]
        );
        if (result.transformed.length !== 1) {
            throw(`Unexpected number of transformed values, expected: 1, got: ${result.transformed.length}`);
        }
        const transformedNode = result.transformed[0];
        if (!ts.isSourceFile(transformedNode)) {
            throw (`Unexpected transformed value type, expected: SourceFile, got: ${transformedNode}`);
        }
        return transformedNode;
    }

    private identifierUsed(identifier: ts.Identifier, node: ts.Node): boolean {
        let isUsed = false;
        ts.forEachChild(node, (child) => {
            if (!ts.isIdentifier(child)) {
                if (!ts.isImportClause(child)) {
                    isUsed = this.identifierUsed(identifier, child);
                }
            } else {
                if (child.text === identifier.text) {
                    isUsed = true;
                }
            }
            return isUsed;
        });
        return isUsed;
    }

    private extractSceneClass(source: ts.SourceFile): ts.ClassDeclaration {
        const exported: string[] = [];
        ts.forEachChild(source, (node) => {
            if (!ts.isExportAssignment(node)) {
                return;
            }
            ts.forEachChild(node, (child) => {
                if (!ts.isIdentifier(child)) {
                    return;
                }
                exported.push(child.escapedText.toString());
            });
        });
        const exportedScenes: ts.ClassDeclaration[] = [];
        ts.forEachChild(source, (node) => {
            if (!ts.isClassDeclaration(node)) {
                return;
            }
            let name = "";
            let scene = false;
            ts.forEachChild(node, (child) => {
                if (ts.isIdentifier(child)) {
                    name = child.escapedText.toString();
                    return;
                }
                if (ts.isHeritageClause(child)) {
                    ts.forEachChild(child, (extender) => {
                        if (!ts.isExpressionWithTypeArguments(extender)) {
                            return;
                        }
                        ts.forEachChild(extender, (extended) => {
                            if (!ts.isIdentifier(extended)) {
                                return;
                            }
                            if (extended.escapedText === "Scene") {
                                scene = true;
                            }
                        });
                    });
                }
            });
            if (!exported.includes(name) || !scene) {
                return;
            }
            exportedScenes.push(node);
        });
        if (exportedScenes.length > 1 || exportedScenes.length <= 0) {
            throw ("Scene source file must contain atleast and only one scene that is exported as default");
        }
        return exportedScenes[0];
    }

}

export default SceneWriter;