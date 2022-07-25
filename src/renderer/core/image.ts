import { GRPInterface, UnitTileScale, ImageDAT } from "common/types";
import type { Color, Object3D } from "three";
import { Unit } from "./unit";

export interface Image extends Object3D {
  dat: ImageDAT;
  setFrame: (frame: number, flip: boolean) => void;

  _zOff: number;

  // for iscript sprite
  readonly unitTileScale: UnitTileScale;

  setModifiers: (modifier: number, modifierData1: number, modifierData2: number) => void;
  resetModifiers: () => void;
  setTeamColor: (color: Color) => void;

  changeImage(atlas: GRPInterface, imageDef: ImageDAT, force?: boolean): void;

  userData: {
    unit?: Unit,
    typeId: number;
  }
};
