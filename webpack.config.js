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

const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        // startup: path.join(__dirname, "./src/frontend/startup/index.ts"),
        editor: path.join(__dirname, "./src/frontend/editor/index.ts"),
        startup: path.join(__dirname, "./src/frontend/startup/index.ts"),
    },
    plugins: [
        new webpack.ExternalsPlugin('commonjs', [
            'electron'
        ])
    ],
    output: {
        path: path.resolve(__dirname, "lib/")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: [
                    path.resolve(__dirname, "node_modules/"),
                    path.resolve(__dirname, "src/backend/")
                ],
                options: {
                    compilerOptions: {
                        outDir: './lib'
                    }
                }
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};