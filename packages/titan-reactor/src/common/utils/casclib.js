// export * from "../../renderer/ipc/casclib";
import * as casclib from "casclib";
let _storageHandle;
let _lastBwPath;

export const readCascFile = (filePath) => {
  try {
    return casclib.readFile(_storageHandle, filePath);
  } catch (e) {
    console.error("failed loading casc file, retrying open casc");
    casclib.openStorage(_lastBwPath);
    return casclib.readFile(_storageHandle, filePath);
  }
};
export default readCascFile;

export const openCascStorage = async (bwPath) => {
  _lastBwPath = bwPath;
  if (_storageHandle) {
    casclib.closeStorage(_storageHandle);
  }
  _storageHandle = await casclib.openStorage(bwPath);
};

export const closeCascStorage = () =>
  _storageHandle && casclib.closeStorage(_storageHandle);
