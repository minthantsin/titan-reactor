import { SceneState } from "common/types";
import { Home } from "./home/home";
import { createWraithScene, getSurface } from "./home/wraith-scene";
import { root } from "./render/root";

export async function loadHomePageLight(): Promise<SceneState> {
  root.render(<Home surface={getSurface().canvas} />);
  return {
    id: "@home",
    start: () => {},
    dispose: () => {},
    beforeNext: () => {
      root.render(null);
    },
  };
}

export async function loadHomePage(): Promise<SceneState> {
  const wraithScene = await createWraithScene();
  root.render(<Home surface={wraithScene.surface.canvas} />);

  return {
    id: "@home",
    start: () => {
      wraithScene.start();
    },
    dispose: () => {
      wraithScene.dispose();
    },
    beforeNext: () => {
      root.render(null);
    },
  };
}
