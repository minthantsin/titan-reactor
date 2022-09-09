import { Unit } from "@core/unit";
import { SparseList } from "@utils/sparse-list";
import { SpriteType } from "common/types";
import { Group } from "three";

export class SpriteEntities {
    group = new Group();

    #spritesMap: Map<number, SpriteType> = new Map();
    #spritePool: SpriteType[] = [];

    // duplicate access
    #unitsBySprite: Map<number, Unit> = new Map();
    #spritesList = new SparseList<SpriteType>();

    constructor() {
        this.group.name = "sprites";
    }

    get(spriteIndex: number) {
        return this.#spritesMap.get(spriteIndex);
    }

    getOrCreate(spriteIndex: number, spriteTypeId: number) {
        let sprite = this.#spritesMap.get(spriteIndex);
        if (!sprite) {
            if (this.#spritePool.length) {
                sprite = this.#spritePool.pop() as SpriteType;
            } else {
                sprite = new Group() as SpriteType;
                sprite.name = "sprite";
            }
            this.#spritesMap.set(spriteIndex, sprite);
            this.group.add(sprite);
            this.#spritesList.add(sprite);
            sprite.matrixAutoUpdate = false;
            sprite.userData.isNew = true;

        }

        // if (sprite.userData.typeId !== spriteTypeId) {
        // }
        sprite.userData.typeId = spriteTypeId;

        return sprite;
    }

    free(spriteIndex: number) {
        const sprite = this.#spritesMap.get(spriteIndex);
        if (sprite) {
            sprite.removeFromParent();
            this.#spritePool.push(sprite);
            this.#spritesMap.delete(spriteIndex);
            this.#spritesList.delete(sprite);
            this.#resetSpriteUserData(sprite);
        }
        this.#unitsBySprite.delete(spriteIndex);
    }

    #resetSpriteUserData(sprite: SpriteType) {
        sprite.userData.typeId = -1;
    }

    clear() {
        for (const sprite of this.#spritesMap.values()) {
            this.#resetSpriteUserData(sprite);
            this.#spritePool.push(sprite);
        }
        this.#spritesMap.clear();
        this.#unitsBySprite.clear();
        this.#spritesList.clear();
        // we do not clear this.group as we do that before first frame to avoid flickering
    }

    getUnit(spriteIndex: number) {
        return this.#unitsBySprite.get(spriteIndex);
    }

    setUnit(spriteIndex: number, unit: Unit) {
        this.#unitsBySprite.set(spriteIndex, unit);
    }
}