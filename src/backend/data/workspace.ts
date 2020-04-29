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
 * Workspace represents a workspace, global configuration for JamJar Editor,
 * containing the path of the last opened project.
 */
class Workspace {
    public lastProjectPath: string | undefined;

    constructor(lastProjectPath: string | undefined) {
        this.lastProjectPath = lastProjectPath;
    }

    /**
     * Generate value copy of workspace
     */
    public Copy(): Workspace {
        return new Workspace(
            this.lastProjectPath,
        );
    }

    /**
     * Convert a JSON object into a Workspace object
     * @param json JSON object to convert
     */
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): Workspace {
        // Any allowed here as JSON can be an object of any structure
        return new Workspace(
            json["lastProjectPath"]
        );
    }
}

export default Workspace;