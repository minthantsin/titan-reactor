const { promises } = window.require("fs");
const path = window.require("path");
import { CanvasTexture } from "three";
import { getAppCachePath } from "../../../electron/invoke";
import { savePNG } from "../../2d-map-rendering/image/png";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { fstat } from "fs";
const BufferList = require("bl");

export class Cache {
  static save(filepath, data) {
    console.log("save", data);
    const filename = path.basename(filepath);
    const cacheFile = path.join(getAppCachePath.cachePath, `${filename}.chk`);

    return promises.writeFile(cacheFile, data).then(() => data);
  }

  static convertAndSaveMapTexture(filepath, id, data, width, height) {
    const filename = path.basename(filepath);
    const cacheFile = path.join(
      getAppCachePath.cachePath,
      `${filename}-${id}.png`
    );

    savePNG(data, width, height, cacheFile);
    const canvas = rgbToCanvas({ data, width, height });
    return new CanvasTexture(canvas);
  }

  static restore(path) {
    return promises.readFile(path).then((data) => {
      console.log(new BufferList(data).slice(0));
      return new BufferList(data).slice(0);
    });
  }

  static restoreToCanvas(path) {
    const img = new Image();
    img.src = path;

    return img.decode().then(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      return canvas;
    });
  }
}
