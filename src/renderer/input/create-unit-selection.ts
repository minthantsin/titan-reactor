import { Unit } from "@core/unit";
import { inverse } from "@utils/function-utils";
import { canOnlySelectOne } from "@utils/unit-utils";
import { Camera, Object3D, PerspectiveCamera, Raycaster, Scene, Vector2 } from "three";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import { World } from "@core/world/world";
import { Borrowed } from "@utils/object-utils";
import { ViewInputComposer } from "@core/world/view-composer";

const MIN_DRAG_SIZE = 0.01;

const typeIdSort = (a: Unit, b: Unit) => {
    return a.typeId - b.typeId;
}
const _hasAnyUnit = (unit: Unit) => !unit.extras.dat.isBuilding;
const _selectRayCaster = new Raycaster();
let _unit: Unit | null;
let _mouseV = new Vector2();

export enum UnitSelectionStatus {
    None,
    Dragging,
    Hovering
}

//TODO: weaken scene handle
export const createUnitSelectionBox = (world: Borrowed<World>, mouseRef: WeakRef<ViewInputComposer["inputs"]["mouse"]>, scene: Scene, onGetUnit: (objects: Object3D) => Unit | null) => {
    const selectionBox = new SelectionBox(new PerspectiveCamera, scene);

    let _selectActivated = false;
    let _enabled = true;
    let _status = UnitSelectionStatus.None;

    const _selectDown = (mouse: ViewInputComposer["inputs"]["mouse"]) => {
        if (mouse.move.z !== 0 || !_enabled) return;
        _selectActivated = true;
        selectionBox.startPoint.set(mouse.move.x, mouse.move.y, 0.5);

        world.events!.emit("unit-selection-start");
    };

    // const hoverUnit = throttle((event: PointerEvent) => {
    //     const unit = getUnitFromMouseIntersect(_mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
    //     if (unit) {
    //         mouseCursor.hover();
    //     } else {
    //         mouseCursor.pointer();
    //     }
    // }, 100);

    const _selectMove = (mouse: ViewInputComposer["inputs"]["mouse"]) => {
        if (!_enabled) return;

        if (_selectActivated) {

            selectionBox.endPoint.set(mouse.move.x, mouse.move.y, 0.5);

            world.events!.emit("unit-selection-move");

            _status = UnitSelectionStatus.Dragging;

        } else {
            // hoverUnit(event)
        }

    }

    const getUnitFromMouseIntersect = (clipV: Vector2) => {
        _selectRayCaster.setFromCamera(clipV, selectionBox.camera);
        // const intersects = _selectRayCaster.intersectObjects(spritesGroup.children, true);
        const intersects = _selectRayCaster.intersectObjects(selectionBox.scene.children, true);
        if (intersects.length) {
            let closestUnit: Unit | undefined;
            let closestRenderOrder = -1;

            for (const intersect of intersects) {
                _unit = onGetUnit(intersect.object);
                if (
                    _unit
                ) {
                    if (
                        intersect.object.renderOrder > closestRenderOrder
                    ) {
                        closestRenderOrder = intersect.object.renderOrder;
                        closestUnit = _unit;
                    }
                }
            }

            return closestUnit;
        }
    };

    const _selectUp = (mouse: ViewInputComposer["inputs"]["mouse"]) => {
        if (!_selectActivated || !_enabled) return;

        _selectActivated = false;

        _status = UnitSelectionStatus.None;

        let draft: Unit[] = [];

        if (!(Math.abs(mouse.move.x - selectionBox.startPoint.x) > MIN_DRAG_SIZE &&
            Math.abs(mouse.move.y - selectionBox.startPoint.y) > MIN_DRAG_SIZE)) {

            const unit = getUnitFromMouseIntersect(_mouseV.set(mouse.move.x, mouse.move.y));

            if (unit) {
                draft.push(unit);
            } else {
                world.events!.emit("unit-selection-end", []);
                return;
            }

        } else {

            selectionBox.endPoint.set(mouse.move.x, mouse.move.y, 0.5);

            const allSelected = selectionBox.select();

            for (let i = 0; i < allSelected.length; i++) {

                _unit = onGetUnit(allSelected[i]);

                if (_unit && !draft.includes(_unit)) {
                    draft.push(_unit);
                }

            }

            const onlyUnits = draft.filter(_hasAnyUnit);

            if (onlyUnits.length > 0 && onlyUnits.length !== draft.length) {

                draft = onlyUnits;

            }

            // since egg has no cmd icon, dont allow multi select unless they are all the same in which case just select one
            if (
                draft.length > 1 &&
                draft.some(canOnlySelectOne)
            ) {
                if (
                    draft.every((unit) => unit.typeId === draft[0].typeId)
                ) {
                    draft = draft.slice(-1);
                } else {
                    draft = draft.filter(inverse(canOnlySelectOne));
                }
            }
        }

        draft.sort(typeIdSort).splice(12);

        world.events!.emit("unit-selection-end", draft);

    }

    return {
        get status() {
            return _status;
        },
        set camera(camera: Camera) {
            selectionBox.camera = camera;
        },
        set enabled(value: boolean) {
            world.events!.emit("unit-selection-enabled", value);
            _enabled = value;
            _selectActivated = value && _selectActivated;
        },
        get enabled() {
            return _enabled;
        },
        get isActive() {
            return _selectActivated;
        },
        update() {
            const mouse = mouseRef.deref();

            if (!mouse) return;

            if (mouse!.clicked) {
                _selectDown(mouse);
            } else if (mouse!.released) {
                _selectUp(mouse);
            } else {
                _selectMove(mouse);
            }
        }
    }

}