import TitanImage3D from "titan-reactor-shared/image/TitanImage3D";
import TitanImageHD from "titan-reactor-shared/image/TitanImageHD";
import TitanImageSD from "titan-reactor-shared/image/TitanImageSD";

export default (bwDat, atlases, createIScriptRunner, onError = () => {}) => {
  return (image, sprite) => {
    const atlas = atlases[image];
    if (!atlas) {
      onError(`composite ${image} has no atlas, did you forget to load one?`);
      return null;
    }

    const imageDef = bwDat.images[image];

    let titanImage;
    if (atlas.model) {
      titanImage = new TitanImage3D(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else if (atlas.diffuse) {
      titanImage = new TitanImageHD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else {
      titanImage = new TitanImageSD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    }
    return titanImage;
  };
};
