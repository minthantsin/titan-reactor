import { SceneState } from "common/types";
import { InterstitialScene } from "./interstitial-scene";
import { getSurface } from "../home/space-scene";
import { root } from "@render";

export async function interstitialSceneLoader(): Promise<SceneState> {
  root.render(<InterstitialScene surface={getSurface().canvas} />);
  return {
    id: "@interstitial",
    start: () => {},
    dispose: () => {},
    beforeNext: () => {
      root.render(null);
    },
  };
}
