import { Texture } from "three";
import { UnitTileScale, GrpType, ImageDAT } from "common/types";
import { loadAnimAtlas } from "./load-anim-atlas";
import { GlbAtlas } from "./glb-atlas";
import loadGlb from "../formats/load-glb";

export const loadGlbAtlas = async (glbFileName: string,
    loadAnimBuffer: () => Promise<Buffer>,
    imageDef: ImageDAT,
    scale: UnitTileScale,
    grp: GrpType,
    envMap: Texture
) => {

    const anim = await loadAnimAtlas(loadAnimBuffer, imageDef, scale, grp);

    try {
        const { model, animations } = (await loadGlb(
            glbFileName,
            envMap,
            imageDef.name
        ));

        const looseFrames = anim.frames.length % 17;

        const fixedFrames = anim.frames.map((_, i) => {
            if (imageDef.gfxTurns) {
                if (i < anim.frames.length - looseFrames) {
                    return Math.floor(i / 17);
                } else {
                    return Math.floor(i / 17) + (i % 17);
                }
            } else {
                return i;
            }
        });

        return new GlbAtlas(anim, model, animations, fixedFrames)
    } catch (e) {
    }

    return anim;
}
