import { CompressedTexture, Sprite, SpriteMaterial } from "three";

import { SpriteDAT } from "../../common/bwdat/sprites-dat";
import gameStore from "../stores/game-store";

export class SelectionCircle extends Sprite {
  spriteDef?: SpriteDAT;
  grp: any;

  constructor() {
    super(
      new SpriteMaterial({
        // @ts-ignore
        onBeforeCompile: (shader) => {
          const fs = shader.fragmentShader;
          shader.fragmentShader = fs.replace(
            "#include <map_fragment>",
            `
                #include <map_fragment>
                diffuseColor = vec4(0., 1., 0., diffuseColor.a * 0.5);
            `
          );
        },
      })
    );
    this.material.depthTest = false;
    this.material.transparent = true;
  }

  update(spriteDef: SpriteDAT) {
    const circle = spriteDef.selectionCircle;
    if (spriteDef !== this.spriteDef) {
      const grp = gameStore().assets?.selectionCirclesHD[circle.index];
      this.material.map = grp?.diffuse as CompressedTexture;
      this.material.needsUpdate = true;
      this.position.z = spriteDef.selectionCircleOffset / 32;
      this.scale.set(
        (grp?.textureWidth as number) / 128,
        (grp?.textureHeight as number) / 128,
        1
      );
      this.grp = grp;
    }
    this.spriteDef = spriteDef;
  }
}
export default SelectionCircle;
