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

import { TemplateDelegate } from "handlebars";
import ISceneTemplater from "./iscene_templater";

/**
 * SceneTemplater can template out a Scene file, based on the file path
 * provided, generating Scene class source code.
 */
class SceneTemplater implements ISceneTemplater {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    // Handlebars uses any, requires use of any here
    private sceneTemplate: TemplateDelegate<any>;
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    // Handlebars uses any, requires use of any here
    constructor(sceneTemplate: TemplateDelegate<any>) {
        this.sceneTemplate = sceneTemplate;
    }

    /**
     * Template takes in a scene filepath and generates source code for it
     * through templating
     * @param path The scene file to template to
     */
    public Template(path: string): string {
        // Extract file name from path
        const filename = path.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, "");
        // Convert file name to pascal case for Scene class name
        const name = this.toPascalCase(filename);
        return this.sceneTemplate({
            name: name
        });
    }

    private toPascalCase(snakeCase: string): string {
        const splitSnake = snakeCase.split('_');
        for (let i = 0; i < splitSnake.length; i++) {
            splitSnake[i] = splitSnake[i].slice(0, 1).toUpperCase() + splitSnake[i].slice(1, splitSnake[i].length);
        }
        return splitSnake.join('');
    }
}

export default SceneTemplater;