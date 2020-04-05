import { TemplateDelegate } from "handlebars";

class Templater {
    private sceneTemplate: TemplateDelegate<any>;
    constructor(sceneTemplate: TemplateDelegate<any>) {
        this.sceneTemplate = sceneTemplate;
    }

    public GenerateSource(path: string): string {
        const filename = path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "");
        const name = this.toPascalCase(filename);
        return this.sceneTemplate({
            name: name
        });
    }

    private toPascalCase(snakeCase: string): string {
        let splitSnake = snakeCase.split('_');
        for (var i = 0; i < splitSnake.length; i++) {
            splitSnake[i] = splitSnake[i].slice(0, 1).toUpperCase() + splitSnake[i].slice(1, splitSnake[i].length);
        }
        return splitSnake.join('');
    }
}

export default Templater;