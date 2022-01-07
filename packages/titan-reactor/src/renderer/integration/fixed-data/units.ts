import { unitTypes } from "../../../common/bwdat/enums";
import { BwDAT, UnitDAT } from "../../../common/types/bwdat";
import BufferView from "./buffer-view";
import { UnitRAW } from "../unit-raw";

// status_flag_completed = 1,
// 		status_flag_grounded_building = 2,
// 		status_flag_flying = 4,
// 		status_flag_8 = 8,
// 		status_flag_burrowed = 0x10,
// 		status_flag_in_bunker = 0x20,
// 		status_flag_loaded = 0x40,

// 		status_flag_requires_detector = 0x100,
// 		status_flag_cloaked = 0x200,
// 		status_flag_disabled = 0x400,
// 		status_flag_passively_cloaked = 0x800,
// 		status_flag_order_not_interruptible = 0x1000,
// 		status_flag_iscript_nobrk = 0x2000,
// 		status_flag_4000 = 0x4000,
// 		status_flag_cannot_attack = 0x8000,
// 		status_flag_can_turn = 0x10000,
// 		status_flag_can_move = 0x20000,
// 		status_flag_collision = 0x40000,
// 		status_flag_immovable = 0x80000,
// 		status_flag_ground_unit = 0x100000,
// 		status_flag_no_collide = 0x200000,
// 		status_flag_400000 = 0x400000,
// 		status_flag_gathering = 0x800000,
// 		status_flag_turret_walking = 0x1000000,

// 		status_flag_invincible = 0x4000000,
// 		status_flag_ready_to_attack = 0x8000000,

// 		status_flag_speed_upgrade = 0x10000000,
// 		status_flag_cooldown_upgrade = 0x20000000,
// 		status_flag_hallucination = 0x40000000,
// 		status_flag_lifetime_expired = 0x80000000,

const flags = Object.freeze({
  completed: 1,
  groundedBuilding: 2,
  flying: 4,
  loaded: 0x40,
  cloaked: 0x200,
  passivelyCloaked: 0x800,
  canTurn: 0x10000,
  canMove: 0x20000,
});


// get dat(): UnitDAT {
//   return (this.bwDat as BwDAT).units[this.typeId];
// }

// get remainingBuildTime() {
//   if (this.dat.isResourceContainer && this.isComplete) {
//     return 0;
//   }
//   return this._read(22);
// }

// get resourceAmount() {
//   if (this.dat.isResourceContainer && this.isComplete) {
//     // remainingBuildTime
//     return this._read(22);
//   }
//   return null;
// }

export const UNIT_BYTE_LENGTH = 30;
// all units in a bw frame
export class UnitsBW extends BufferView<UnitRAW> implements UnitRAW {

  get id() {
    return this._readU(0);
  }

  get typeId() {
    return this._read(2);
  }

  get owner() {
    return this._read(4);
  }

  get x() {
    return this._read(6);
  }

  get y() {
    return this._read(8);
  }

  get hp() {
    return this._read(10);
  }

  get energy() {
    return this._read(12);
  }

  get spriteIndex() {
    return this._read(14);
  }

  get statusFlags() {
    return this._read(16);
  }

  get direction() {
    return this._read(20);
  }

  get remainingBuildTime() {
    return this._read(22);
  }

  get shields() {
    return this._read(24);
  }

  get order() {
    return this._readU(26);
  }

  get remainingTrainTime() {
    return this._readU(27);
  }

  get kills() {
    return this._read(28);
  }

  get angle() {
    let d = this.direction;
    d -= 64;
    if (d < 0) {
      d += 256;
    }
    return -((d * Math.PI) / 128) + Math.PI / 2;
  }

  get isFlying() {
    return (this.statusFlags & flags.flying) != 0;
  }

  get isCloaked() {
    return (
      ((this.statusFlags & flags.cloaked) != 0 ||
        (this.statusFlags & flags.passivelyCloaked) != 0) &&
      this.typeId !== unitTypes.spiderMine
    );
  }

  get isComplete() {
    return (this.statusFlags & flags.completed) != 0;
  }

  get isLoaded() {
    return (this.statusFlags & flags.loaded) != 0;
  }

  get tileX() {
    return Math.floor(this.x / 32);
  }

  get tileY() {
    return Math.floor(this.y / 32);
  }

  override object() {
    return {
      id: this.id,
      typeId: this.typeId,
      owner: this.owner,
      x: this.x,
      y: this.y,
      hp: this.hp,
      energy: this.energy,
      shields: this.shields,
      spriteIndex: this.spriteIndex,
      statusFlags: this.statusFlags,
      direction: this.direction,
      remainingBuildTime: this.remainingBuildTime,
      remainingTrainTime: this.remainingTrainTime,
      angle: this.angle,
      isFlying: this.isFlying,
      isCloaked: this.isCloaked,
      isComplete: this.isComplete,
      tileX: this.tileX,
      tileY: this.tileY,
      order: this.order,
      kills: this.kills,
    };
  }
}
export default UnitsBW;
