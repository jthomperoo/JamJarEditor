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

/**
 * Project represents a JamJar Editor project, containing specs and the last
 * opened scene for a project. Used to load previously opened
 * projects/scenes/specs. 
 */
class Project {
    public lastScenePath: string | undefined;
    public path: string;
    public specs: string[];

    constructor(lastScenePath: string | undefined, path: string, specs: string[]) {
        this.lastScenePath = lastScenePath;
        this.path = path;
        this.specs = specs;
    }

    /**
     * Generate value copy of project.
     */
    public Copy(): Project {
        return new Project(
            this.lastScenePath,
            this.path,
            this.specs
        );
    }

    /**
     * Convert a JSON object into a Project object
     * @param json JSON object to convert
     */
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): Project {
        // Any allowed here as JSON can be an object of any structure
        return new Project(
            json["lastScenePath"],
            json["path"],
            json["specs"]
        );
    }
}

export default Project;