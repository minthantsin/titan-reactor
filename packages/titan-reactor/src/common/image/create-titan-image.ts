import { SpriteInstance } from "../../renderer/game";
import { drawFunctions } from "../bwdat/enums";
import { BwDATType, createIScriptRunner } from "../types";
import Grp3D from "./grp-3d";
import GrpHD from "./grp-hd";
import GrpSD from "./grp-sd";
import { ImageInstance } from "./image-instance";
import TitanImage3D from "./titan-image-3d";
import TitanImageHD from "./titan-image-hd";
import TitanImageSD from "./titan-image-sd2";

export const createTitanImageFactory = (
  bwDat: BwDATType,
  atlases: Grp3D[] | GrpHD[] | GrpSD[],
  createIScriptRunner: createIScriptRunner,
  onError: (msg: string) => void
): ImageInstance | null => {
  return (imageId: number, sprite: SpriteInstance): ImageInstance | null => {
    const atlas = atlases[imageId];
    if (!atlas || typeof atlas === "boolean") {
      onError(`composite ${imageId} has no atlas, did you forget to load one?`);
      return null;
    }

    const imageDef = bwDat.images[imageId];

    let titanImage;
    if (atlas instanceof GrpSD) {
      titanImage = new TitanImageSD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else if (
      // @todo make a smarter image factory that knows if the mainImage is a Grp3D or GrpHD
      // don't load shadow images for 3d
      atlas instanceof Grp3D &&
      bwDat.images[imageId].drawFunction === drawFunctions.rleShadow
    ) {
      return null;
    } else if (atlas instanceof Grp3D && atlas.model) {
      // only if the model exists
      titanImage = new TitanImage3D(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else {
      titanImage = new TitanImageHD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    }

    return titanImage;
  };
};
export default createTitanImageFactory;
