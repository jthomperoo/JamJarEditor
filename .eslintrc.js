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

module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    env: {
        "browser": true,
        "node": true,
        "jasmine": true
    },
    plugins: ["@typescript-eslint"],
    parserOptions: {
        ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
        sourceType: "module",  // Allows for the use of imports
    },
    rules: {
        "no-undef": "off",
        "semi": 2,
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/interface-name-prefix": [
            "error",
            { "prefixWithI": "always" }
        ],
        "eqeqeq": 2
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    },
};