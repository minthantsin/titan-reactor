import { generateLayeredDisplacementMap } from "../2d-map-rendering/generators/generateLayeredDisplacementMap";
import { generateMap } from "../2d-map-rendering/generators/generateMap";
import { generateElevationBasedMap } from "../2d-map-rendering/generators/generateElevationBaseMap";
import * as THREE from "three";
// import { Cache } from "../utils/electron/cache";
import { generateTerrainMesh } from "./generateTerrainMesh";
import { rgbToCanvas } from "../2d-map-rendering/image/canvas";

const Cache = {
  restore: (filepath) => Promise.reject(),
  save: (filepath, data) => Promise.resolve(data),
  convertAndSaveMapTexture: (id, data, width, height) =>
    Promise.resolve(
      new THREE.CanvasTexture(rgbToCanvas({ data, width, height }))
    ),
};

const flip = (texture) => {
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.repeat.x = -1;
  // texture.flipY = false;
  console.log("no flip");
  return texture;
};

const encoding = (texture) => {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
};

export const mapPreviewLoader = async (chk, canvas, ignoreCache = false) => {
  const { data, width, height } = await generateMap({
    chk,
    scale: 0.25 * 0.25,
    blur: 0,
  });

  return rgbToCanvas({
    data,
    width,
    height,
    defaultCanvas: canvas,
  });
};

export const mapElevationsLoader = async (chk, ignoreCache = false) => {
  const { data, width, height } = await generateMap({
    chk,
    scale: 0.25 * 0.5,
    blur: 0,
    renderElevations: true,
  });

  const texture = await Cache.convertAndSaveMapTexture(
    "map",
    data,
    width,
    height
  );
  return encoding(texture);
};

export const mapLoader = async (
  chk,
  renderer,
  preset = {},
  ignoreCache = false
) => {
  const { data, width, height } = await generateMap({
    chk,
    scale: 1,
    blur: 0,
    ...preset,
  });

  const texture = Cache.convertAndSaveMapTexture("map", data, width, height);

  return encoding(texture);
};

export const bgLoader = async (
  chk,
  renderer,
  preset = {},
  ignoreCache = false
) => {
  const { data, width, height } = await generateMap({
    chk,
    scale: 0.25 * 0.25,
    blur: 16,
    ...preset,
  });

  const texture = await Cache.convertAndSaveMapTexture(
    "bg",
    data,
    width,
    height
  );
  return encoding(texture);
};

export const displaceLoader = async (
  chk,
  renderer,
  preset = {},
  ignoreCache = false
) => {
  const scale = 0.25;
  const width = chk.size[0] * 32 * scale;
  const height = chk.size[1] * 32 * scale;

  const image = await generateLayeredDisplacementMap({
    chk,
    width,
    height,
    elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
    detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
    detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
    walkableLayerBlur: 16,
    allLayersBlur: 8,
    ...preset,
  });
  return Cache.convertAndSaveMapTexture("displace", image, width, height);
};

export const roughnessLoader = async (
  chk,
  renderer,
  preset = {},
  ignoreCache
) => {
  const { data, width, height } = await generateElevationBasedMap({
    chk,
    elevations: [1, 1, 1, 1, 1, 1, 1],
    detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
    scale: 0.5,
    blur: 0,
    water: true,
    lava: false,
    twilight: false,
    skipDetails: false,
    onlyWalkable: false,
    ...preset,
  });

  return Cache.convertAndSaveMapTexture("rough", data, width, height);
};

export function loadAllTerrain(chk, renderer, preset, ignoreCache = true) {
  return Promise.all([
    mapLoader(chk, renderer, {}, ignoreCache),
    bgLoader(chk, renderer, {}, ignoreCache),
    displaceLoader(chk, renderer, {}, ignoreCache),
    roughnessLoader(chk, renderer, {}, ignoreCache),
  ]).then((args) =>
    generateTerrainMesh(renderer, chk.size[0], chk.size[1], ...args)
  );
}
