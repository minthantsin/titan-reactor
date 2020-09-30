import {
  iscriptHeaders as headers,
  headersById,
} from "../../common/bwdat/iscriptHeaders";
import { DebugLog } from "../utils/DebugLog";

export class IScriptRunner {
  constructor(bwDat, iscriptId, parent, state = {}, listeners = {}) {
    this.bwDat = bwDat;
    // unit if its the first IScript runner, or IScriptRunner if it is a child
    this.parent = parent;
    this.logger = new DebugLog("iscript", { ...parent, iscriptId });
    this.dispatched = {};
    this.iscript = bwDat.iscript.iscripts[iscriptId];
    this.hasRunAnimationBlockAtLeastOnce = {};
    // blocks that exist outside this "unit iscript"
    this.state = {
      children: [],
      //@todo consider changing to delta
      waiting: 0,
      image: null,
      matchParentFrame: false,
      terminated: false,
      isGndWpnAnimationBlock: false,
      isAirWpnAnimationBlock: false,
      lifted: false,
      noBrkCode: false,
      ignoreRest: false,
      frameset: null,
      frame: 0,
      prevFrame: 0,
      flipFrame: false,
      direction: 0,
      ...state,
    };
    this.listeners = listeners;
    this.dbg = {};

    if (!this.state.image) {
      throw new Error("image required");
    }

    if (this.state.image.gfxTurns) {
      this.state.frameset = 0;
    }
  }

  toAnimationBlock(header) {
    this.dbg.prevAnimBlock = {
      commands: this.commands,
      commandIndex: this.commandIndex,
    };
    return this._toAnimationBlock(this.iscript.offsets[header], header);
  }

  _toAnimationBlock(offset, header = -1) {
    const commands = this.bwDat.iscript.animationBlocks[offset];
    if (!commands) {
      let name = "local";
      if (header >= 0) {
        name = headersById[header];
      }
      console.error(`animation block - ${name} - does not exist`, this);
      this.state.ignoreRest = true;
      return;
    }

    this.hasRunAnimationBlockAtLeastOnce[header] = true;
    this.commands = commands;
    this.commands.header = header;
    this.commandIndex = 0;
    Object.assign(this.state, {
      waiting: 0,
      ignoreRest: false,
    });

    if (header === headers.liftOff) {
      this.state.lifted = true;
    } else if (header === headers.landing) {
      this.state.lifted = false;
    }

    if (header === -1) {
      this.logger.log(`_animation block - local`, this);
    } else {
      this.logger.log(`_animation block - ${headersById[header]}`, this);
    }

    if (this.dbg && this.dbg.prevAnimBlock && this.dbg.prevAnimBlock.commands) {
      if (this.dbg.prevAnimBlock.commands.header === -1) {
        this.logger.log(`prev anim - local`, this);
      } else {
        this.logger.log(`prev anim - ${headersById[header]}`, this);
      }
    }

    return this;
  }

  update() {
    this.dispatched = {};
    this.state.children.forEach((runner) => runner.update());
    this.state.children = this.state.children.filter(
      (runner) => !runner.state.terminated
    );

    if (this.state.terminated) {
      return;
    }

    // update graphics state
    // if (this.state.matchParentFrame) {
    //   this.state.frame = this.parent.state.frame;
    // }

    // update iscript state
    if (this.state.waiting !== 0) {
      this.state.waiting = this.state.waiting - 1;
      return;
    }
    this.next();
  }

  add(runner) {
    this.toAnimationBlock(headers.init);
    this.state.children.push(runner);
  }

  on(command, cb) {
    this.listeners[command] = this.listeners[command] || [];
    this.listeners[command].push(cb);
  }

  _dispatch(command, event) {
    this.logger.log(`dispatch ${command}`, event);
    this.listeners[command] &&
      this.listeners[command].forEach((cb) => cb(event));
    this.dispatched[command] = event;
    return true;
  }

  __imgul(imageId, x, y) {
    const image = this.bwDat.images[imageId];

    const runner = new IScriptRunner(
      this.bwDat,
      image.iscript,
      this,
      {
        x,
        y,
        image,
        underlay: true,
      },
      this.listeners
    );
    runner.toAnimationBlock(headers.init);
    this.state.children.push(runner);
    this._dispatch("imgul", runner);
  }

  __imgol(imageId, x, y) {
    const image = this.bwDat.images[imageId];
    const runner = new IScriptRunner(
      this.bwDat,
      image.iscript,
      this,
      {
        x,
        y,
        image,
        overlay: true,
      },
      this.listeners
    );
    runner.toAnimationBlock(headers.init);
    this.state.children.push(runner);
    this._dispatch("imgol", runner);
  }

  __wait(frames) {
    this.state.waiting = frames;
    this._dispatch("wait", frames);
  }

  __waitrand(...frames) {
    this.state.waiting = frames[Math.floor(Math.random() * frames.length)];
    this._dispatch("waitrand", this.state.waiting);
  }

  __followmaingraphic() {
    this.state.matchParentFrame = true;
    this._dispatch("followmaingraphic", true);
  }

  __randcondjmp(probability, offset) {
    if (Math.random() <= probability / 255) {
      this.__goto(
        offset,
        this._dispatch("randcondjmp", { probability, offset, result: true })
      );
    } else {
      this._dispatch("randcondjmp", { probability, offset, result: false });
    }
  }

  __goto(offset, alreadyDispatched) {
    this._toAnimationBlock(offset);
    !alreadyDispatched && this._dispatch("goto", offset);
  }

  // melee only needs 1 level of call stack for broodling
  // should we move commands, commandIndex into state and just create a proper stack?
  __call(offset) {
    this.callStack = {
      commands: this.commands,
      commandIndex: this.commandIndex,
    };
    this.commandIndex = 0;
    this.commands = this.bwDat.iscript.animationBlocks[offset];
    this._dispatch("call", offset);
  }

  __return() {
    this.commands = this.callStack.commands;
    this.commandIndex = this.callStack.commandIndex;
    delete this.callStack;
    this._dispatch("return", true);
  }

  __playsnd(soundId) {
    this._dispatch("playsnd", soundId);
  }

  __playsndbtwn(soundA, soundB) {
    const soundId = Math.floor(Math.random() * (soundB - soundA + 1)) + soundA;
    this._dispatch("playsndbtwn", soundId);
  }

  __playsndrand(numSounds, ...sounds) {
    const soundId = sounds[Math.floor(Math.random() * numSounds)];
    this._dispatch("playsndrand", soundId);
  }

  __attackmelee(numSounds, ...sounds) {
    const soundId = sounds[Math.floor(Math.random() * numSounds)];
    this._dispatch("attackmelee", soundId);
  }

  __end() {
    this.state.terminated = true;

    this.state.children.forEach((runner) =>
      runner.toAnimationBlock(headers.death)
    );

    this._dispatch("end", true);
  }

  __gotorepeatattk() {
    this._dispatch("gotorepeatattk", true);
  }

  __nobrkcodestart() {
    this.state.noBrkCode = true;
    this._dispatch("nobrkcodestart", true);
  }

  __nobrkcodeend() {
    this.state.noBrkCode = false;
    this._dispatch("nobrkcodeend", true);
  }

  __attackwith(weaponType) {
    const unitDef = this.bwDat.units[this.parent.typeId];
    this.__useweapon(
      [weaponType === 1 ? unitDef.groundWeapon : unitDef.airWeapon],
      this._dispatch("attackwith", weaponType)
    );
  }

  __useweapon(weaponId, alreadyDispatched) {
    // carriers, reavers, etc have "no weapon" and use 130 for weaponId
    if (weaponId >= this.bwDat.weapons.length) {
      return;
    }
    const weapon = this.bwDat.weapons[weaponId];
    const runner = new IScriptRunner(
      this.bwDat,
      weapon.flingy.sprite.image.iscript,
      this,
      {
        weapon,
        image: weapon.flingy.sprite.image,
      },
      this.listeners
    );
    runner.toAnimationBlock(headers.init);
    this.state.children.push(runner);
    !alreadyDispatched && this._dispatch("useweapon", weapon);
  }

  //@todo send the weapon id / have better way to manage that state
  __domissiledmg() {
    this._dispatch("domissiledmg", true);
  }

  __dogrddamage() {
    this._dispatch("dogrddamage", true);
  }

  __liftoffcondjmp(offset) {
    if (this.state.lifted) {
      this.__goto(offset, this._dispatch("liftoffcondjmp", true));
    } else {
      this._dispatch("liftoffcondjmp", false);
    }
  }

  __playfram(frame) {
    if (this.state.image.gfxTurns && frame % 17 === 0) {
      this.state.frameset = frame;
      this.setFrameBasedOnDirection();
    } else {
      //@todo see if this matters
      this.state.frameset = null;
      this.setFrame(frame, false);
      this._dispatch("playfram", frame);
    }
  }

  setFrame(frame, flip) {
    this.state.prevFrame = this.state.frame;
    this.state.flipFrame = flip;
    this.state.frame = frame;
  }

  setDirection(direction) {
    this.state.direction = direction;
    if (this.state.image.gfxTurns) {
      if (this.state.frameset === null) {
        this.logger.log(
          `%c cant update frame without frameset`,
          `color:#990011`
        );
        // console.error("cant update frame without frameset");
      } else {
        this.setFrameBasedOnDirection();
      }
    }
  }

  setFrameBasedOnDirection() {
    if (this.state.direction > 16) {
      this.setFrame(this.state.frameset + 32 - this.state.direction, true);
    } else {
      this.setFrame(this.state.frameset + this.state.direction, false);
    }
    this._dispatch(
      "playfram",
      `frame:${this.state.frame} dir:${this.state.direction} frameset:${this.state.frameset} `
    );
  }

  __ignorerest() {
    this.state.ignoreRest = true;
    this._dispatch("ignorerest", true);
  }

  next() {
    if (this.state.ignoreRest) {
      return;
    }
    if (this.commandIndex >= this.commands.length) {
      let nextHeader = this.commands.header;
      let nextAnimationBlock;
      do {
        nextHeader = nextHeader + 1;
        nextAnimationBlock = this.toAnimationBlock(nextHeader);
      } while (!nextAnimationBlock && nextHeader < this.iscript.offsets.length);

      //@todo be able to access next units commands as well
      if (!nextAnimationBlock) {
        debugger;
        throw new Error("ran out of animation blocks");
      }
      return nextAnimationBlock;
    }

    //@todo use state.image.useFullIscript to filter out headers

    const [command, args] = this.commands[this.commandIndex];
    switch (command) {
      case "attack":
      case "castspell":

      case "setfldirect":
      case "playframtile":
      case "sethorpos":
      case "setpos":
      case "setvertpos":
      case "imgolorig":
      case "switchul":
      case "imgoluselo":
      case "imguluselo":
      case "imgulnextid":
      case "sprol":
      case "sproluselo":
      case "highsprol":
      case "lowsprul":
      case "sprul":
      case "spruluselo":
      case "setflipstate":
      case "turnccwise":
      case "turncwise":
      case "turn1cwise":
      case "turnrand":
      // will require getOrder and getOrderTarget from BWAPI
      case "move":
      case "engframe":
      case "engset":
      case "attkshiftproj":
      case "tmprmgraphicstart":
      case "tmprmgraphicend":
      case "setflspeed":
      case "creategasoverlays":
      case "trgtrangecondjmp":
      case "trgtarccondjmp":
      case "imageulnextid":
      case "grdsprol":
      case "warpoverlay":
      //nuclear missile only
      case "curdirectcondjmp":

      case "pwrupcondjmp":
      case "sigorder":
      case "orderdone":
      case "setspawnframe":
      case "uflunstable":
      case "__0c":
      case "__2d":
      case "__3e":
      case "__43":
        this.commandIndex++;
        this.logger.log(command, "not implemented");
        break;
      default:
        this.commandIndex++;
        if (typeof this[`__${command}`] !== "function") {
          throw new Error(`${command} not found in IScriptRunner`);
        }

        this[`__${command}`].apply(this, args);
    }
  }

  dispose() {
    this.listeners = null;
  }
}
