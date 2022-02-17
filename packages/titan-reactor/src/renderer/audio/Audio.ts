import { Vector3 } from "three";
import { SoundDAT } from "../../common/types";
import { SoundStruct } from "../integration/structs";
import { ClassicSound } from "./classic-sound";
import DeferredAudioBuffer from "./deferred-audio-buffer";
import MainMixer from "./main-mixer";

const stopTime = 30; //ms

const isClassicSound = (sound: any): sound is ClassicSound => {
  return sound.extra !== undefined;
}

// an instance of a bw sound
export class Audio {
  static rolloffFactor = 0.5;
  static refDistance = 20;

  mixer: MainMixer;
  buffer: DeferredAudioBuffer;
  isPlaying = false;
  queueStartTime = 0;
  source?: AudioBufferSourceNode;
  gain?: GainNode;
  sound: SoundStruct | ClassicSound;
  dat: SoundDAT;
  mapCoords: Vector3;

  constructor(mixer: MainMixer, sound: SoundStruct | ClassicSound, buffer: DeferredAudioBuffer, soundDat: SoundDAT, mapCoords: Vector3) {
    this.mixer = mixer;
    this.buffer = buffer;
    this.sound = sound;
    this.dat = soundDat;
    this.mapCoords = mapCoords;

  }

  queue(elapsed: number) {
    if (this.source) return;
    this.isPlaying = true;
    this.buffer.lastPlayed = elapsed;
    this.queueStartTime = elapsed;
  }

  play(elapsed: number) {
    if (!this.buffer.buffer) return;
    const offset = (elapsed - this.queueStartTime) * 0.001;
    if (this.source || offset > this.buffer.buffer.duration) return;

    const source = this.mixer.context.createBufferSource();

    const gain = this.mixer.context.createGain();

    let volume = 1;
    let panner;

    if (isClassicSound(this.sound)) {
      panner = this.mixer.context.createStereoPanner();
      panner.pan.value = this.sound.extra.pan;
      volume = this.sound.extra.volume / 100;
    } else {

      panner = this.mixer.context.createPanner();
      panner.panningModel = "HRTF";

      panner.refDistance = Audio.refDistance;
      panner.rolloffFactor = Audio.rolloffFactor;
      panner.distanceModel = "inverse";

      panner.positionX.value = this.mapCoords.x;
      panner.positionY.value = this.mapCoords.y;
      panner.positionZ.value = this.mapCoords.z;
    }
    source.buffer = this.buffer.buffer;

    gain.connect(this.mixer.sound);
    panner.connect(gain);
    source.connect(panner);

    source.onended = () => {
      this.isPlaying = false;
    };

    // gain.gain.exponentialRampToValueAtTime(
    //   Math.min(0.99, volume),
    //   this.mixer.context.currentTime
    // );
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(Math.min(0.99, volume), this.mixer.context.currentTime + 0.01);
    source.start(0);

    this.buffer.lastPlayed = elapsed;
    this.source = source;
    this.gain = gain;
    this.isPlaying = true;
  }

  // https://alemangui.github.io/ramp-to-value
  stop() {
    this.isPlaying = false;

    if (!this.source || !this.gain) {
      return;
    }

    this.gain.gain.setValueAtTime(
      this.gain.gain.value,
      this.mixer.context.currentTime
    );
    this.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.mixer.context.currentTime + stopTime * 0.001
    );
    this.source.onended = null;
  }
}
export default Audio;
