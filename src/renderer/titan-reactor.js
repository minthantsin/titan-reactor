import { TitanReactorMap } from "./TitanReactorMap";
import { TitanReactorReplay } from "./replay/TitanReactorReplay";
import {
  TitanReactorSandbox,
  hot as hotSandbox,
} from "./3d-map-rendering/TitanReactorSandbox";
import { imageChk } from "./utils/loadChk";
import { gameOptions } from "./utils/gameOptions";
import { jssuhLoadReplay } from "./replay/loaders/JssuhLoadReplay";
import { loadAllDataFiles } from "./invoke";
import { ipcRenderer } from "electron";
import React from "react";
import { render } from "react-dom";
import { App } from "./react-ui/App";
import { mapPreviewCanvas } from "./3d-map-rendering/textures/mapPreviewCanvas";
import { DefaultLoadingManager } from "three";

console.log("renderer");
console.log(new Date().toLocaleString());

if (module.hot) {
  module.hot.decline();

  module.hot.accept("./replay/TitanReactorReplay.js", (data) => {
    if (module.hot.data.filepath) {
      console.log("hot loading replay");

      scene = loadReplay(module.hot.data.filepath, module.hot.data);
    }
  });

  module.hot.accept("./3d-map-rendering/TitanReactorSandbox.js", () => {
    console.log("hot loading map ???", hotSandbox);

    if (hotSandbox) {
      console.log("hot loading map");
      scene = loadMap(hotSandbox.filepath);
    }
  });
}

let bwDat = null;
let scene = null;
let appIsReady = true;

async function bootup() {
  let starcraftFont = new FontFace(
    "Blizzard Regular",
    "url(BLIZZARD-REGULAR.TTF)"
    // "url(./bwdata/font/BLIZZARD-REGULAR.TTF)"
  );

  try {
    const loadedFont = await starcraftFont.load();
    document.fonts.add(loadedFont);
  } catch (e) {}

  render(<App />, document.getElementById("app"));
  // if (!(await fs.promises.exists(gameOptions.bwDataPath))) {
  //   // please point us to your starcraft install directory
  // }

  appIsReady = true;

  bwDat = await loadAllDataFiles(gameOptions.bwDataPath);
  console.log("bwDat", bwDat);
}

ipcRenderer.on("open-map", async (event, [map]) => {
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }
  if (scene) {
    scene.dispose();
  }
  console.log("open-map");
  scene = await loadMap(map);
});

let replayPlaylist = [];
let replayIndex = 0;

ipcRenderer.on("open-replay", (event, replays) => {
  console.log("open-replay");
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }
  if (scene) {
    scene.dispose();
  }
  replayPlaylist = replays;
  replayIndex = 0;
  scene = loadReplay(replays[0]);
});

ipcRenderer.on("add-replay", (event, replays) => {
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }
  replayPlaylist = replayPlaylist.concat(replays);
});

ipcRenderer.on("save-image", (event) => {
  var strMime = "image/jpeg";
  const data = renderer.domElement.toDataURL(strMime);

  var saveFile = function (strData, filename) {
    var link = document.createElement("a");
    link.download = "Screenshot";
    link.href = strData;
    link.click();
  };
  saveFile(data);
});
ipcRenderer.on("save-gltf", (event, file) => {
  // Instantiate a exporter
  var exporter = new GLTFExporter();

  // Parse the input and generate the glTF output
  console.log("export scene", file, scene);
  exporter.parse(
    scene,
    function (gltf) {
      fs.writeFile(file, gltf, () => {});
    },
    {}
  );
});

ipcRenderer.on("open-env-settings", (event, [file]) => {
  console.log("open-env", file);
});

ipcRenderer.on("save-env-settings", (event, file) => {
  console.log("save-env", file);
});

const loadMap = async (filepath) => {
  const mapPreviewEl = document.getElementById("map--preview-canvas");
  const mapNameEl = document.getElementById("map-name");
  const mapDescriptionEl = document.getElementById("map-description");
  const loadOverlayEl = document.getElementById("load-overlay");

  // hide loading ui elements
  mapNameEl.innerText = "initializing...";
  mapDescriptionEl.innerText = "";
  mapPreviewEl.style.display = "none";
  loadOverlayEl.style.display = "flex";

  console.log("load chk", filepath);
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  console.log("chk loaded", filepath, chk);

  await mapPreviewCanvas(chk, mapPreviewEl);

  await new Promise((res, rej) => {
    mapNameEl.innerText = chk.title;
    document.title = `Titan Reactor - ${chk.title}`;
    // mapDescriptionEl.innerText = chk.description;
    mapDescriptionEl.innerText = chk.tilesetName;
    mapPreviewEl.style.display = "block";
    setTimeout(res, 100);
  });

  document.title = `Titan Reactor - ${chk.title}`;

  return TitanReactorSandbox(
    filepath,
    chk,
    document.getElementById("three-js"),
    () => (loadOverlayEl.style.display = "none")
  );
};

const loadReplay = async (filepath, hot) => {
  const loadOverlayEl = document.getElementById("load-overlay");

  const jssuh = await jssuhLoadReplay(filepath, gameOptions.bwDataPath);

  return TitanReactorReplay(
    filepath,
    hot,
    jssuh,
    document.getElementById("three-js"),
    bwDat,
    () => (loadOverlayEl.style.display = "none")
  );
};

bootup();
