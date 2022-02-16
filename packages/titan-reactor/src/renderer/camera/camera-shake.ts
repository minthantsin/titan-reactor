import CameraControls from "camera-controls";
import { Camera, Vector3 } from "three";

const ONE_SECOND = 1000;
const FPS = 60;
const _vec3a = new Vector3();
const _vec3b = new Vector3();

class CameraShake {
  private _cameraControls: CameraControls;
  private _duration: number;
  strength = 1;
  private _actualStrength = 0;
  private _noiseX: number[] = [];
  private _noiseY: number[] = [];
  private _noiseZ: number[] = [];

  private _lastOffsetX = 0;
  private _lastOffsetY = 0;
  private _lastOffsetZ = 0;

  private _enabled = true;

  private _lastShakeTime = 0;
  private _randomizedWaitTime = 0;

  isShaking = false;

  private _prevCameraPosition = new Vector3();

  set enabled(val: boolean) {
    this._enabled = val;
    this.isShaking = val === false ? false : this.isShaking;
  }

  get enabled() {
    return this._enabled;
  }

  // frequency: cycle par second
  constructor(
    cameraControls: CameraControls,
    duration = ONE_SECOND,
    frequency = 10,
    strength = 1
  ) {
    this._cameraControls = cameraControls;
    this._duration = duration;

    this.setParams(duration, frequency, strength);
  }

  setParams(duration: number, frequency: number, strength: number) {
    this.strength = strength;
    this._duration = duration;
    this._noiseX = makePNoise1D(
      (duration / ONE_SECOND) * frequency,
      (duration / ONE_SECOND) * FPS
    );
    this._noiseY = makePNoise1D(
      (duration / ONE_SECOND) * frequency * 1.25,
      (duration / ONE_SECOND) * FPS
    );
    this._noiseZ = makePNoise1D(
      (duration / ONE_SECOND) * frequency * 0.75,
      (duration / ONE_SECOND) * FPS
    );
  }

  setParamsV(duration: Vector3, frequency: Vector3, strength: number) {
    this.strength = strength;
    this._noiseX = makePNoise1D(
      (duration.x / ONE_SECOND) * frequency.x,
      (duration.x / ONE_SECOND) * FPS
    );
    this._noiseY = makePNoise1D(
      (duration.y / ONE_SECOND) * frequency.y * 1.25,
      (duration.y / ONE_SECOND) * FPS
    );
    this._noiseZ = makePNoise1D(
      (duration.z / ONE_SECOND) * frequency.z * 0.75,
      (duration.z / ONE_SECOND) * FPS
    );
    this._duration = Math.max(duration.x, duration.y, duration.z);
  }

  shake(elapsed: number) {
    if (this.isShaking || !this.enabled) return;

    if (elapsed - this._lastShakeTime < this._randomizedWaitTime) {
      this._actualStrength = this.strength * 0.2;
    } else {
      this._actualStrength = this.strength;
      this._lastShakeTime = elapsed;
      this._randomizedWaitTime = Math.random() * (this._duration / 2);
    }



    const startTime = performance.now();
    this.isShaking = true;

    const anim = () => {
      const elapsedTime = performance.now() - startTime;
      const frameNumber = ((elapsedTime / ONE_SECOND) * FPS) | 0;
      const progress = elapsedTime / this._duration;
      const ease = sineOut(1 - progress);

      if (progress >= 1) {
        this._lastOffsetX = 0;
        this._lastOffsetY = 0;
        this._lastOffsetZ = 0;

        this.isShaking = false;
        return;
      }

      requestAnimationFrame(anim);

      this._cameraControls.getPosition(_vec3a);
      this._cameraControls.getTarget(_vec3b);

      const offsetX = this._noiseX[frameNumber] * this._actualStrength * ease;
      const offsetY = this._noiseY[frameNumber] * this._actualStrength * ease;
      const offsetZ = this._noiseZ[frameNumber] * this._actualStrength * ease;

      this._lastOffsetX = offsetX;
      this._lastOffsetY = offsetY;
      this._lastOffsetZ = offsetZ;
    };

    anim();
  }

  update(camera: Camera) {
    if (this.isShaking) {
      this._prevCameraPosition.copy(camera.position);
      camera.position.set(this._prevCameraPosition.x + this._lastOffsetX, this._prevCameraPosition.y + this._lastOffsetY, this._prevCameraPosition.z + this._lastOffsetZ);
    }
  }

  restore(camera: Camera) {
    if (this.isShaking) {
      camera.position.copy(this._prevCameraPosition);
    }
  }
}

function makePNoise1D(length: number, step: number) {
  const noise = [];
  const gradients = [];

  for (let i = 0; i < length; i++) {
    gradients[i] = Math.random() * 2 - 1;
  }

  for (let t = 0; t < step; t++) {
    const x = ((length - 1) / (step - 1)) * t;

    const i0 = x | 0;
    const i1 = (i0 + 1) | 0;

    const g0 = gradients[i0];
    const g1 = gradients[i1] || gradients[i0];

    const u0 = x - i0;
    const u1 = u0 - 1;

    const n0 = g0 * u0;
    const n1 = g1 * u1;

    noise.push(n0 * (1 - fade(u0)) + n1 * fade(u0));
  }

  return noise;
}

function fade(t: number) {
  return t * t * t * (t * (6 * t - 15) + 10);
}

const HALF_PI = Math.PI * 0.5;

function sineOut(t: number) {
  return Math.sin(t * HALF_PI);
}

export default CameraShake;
