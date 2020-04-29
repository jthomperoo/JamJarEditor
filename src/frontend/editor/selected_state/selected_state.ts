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

import Entity from "../../../shared/data/entity";
import ISelectedState from "./iselected_state";

class SelectedState implements ISelectedState {
    private selected?: Entity;

    constructor(selected?: Entity) {
        this.selected = selected;
    }

    public SetSelected(selected: Entity | undefined): void {
        if (selected === undefined) {
            this.selected = undefined;
            return;
        }
        this.selected = selected.Copy();
    }

    public GetSelected(): Entity | undefined {
        if (this.selected === undefined) {
            return undefined;
        }
        return this.selected.Copy();
    }
}

export default SelectedState;