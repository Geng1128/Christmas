// types.ts
import * as THREE from 'three';

export type HandGesture = 'OPEN' | 'FIST' | 'VICTORY' | 'GUN' | 'THUMB' | 'NONE';

export interface Config {
  particleCount: number;
  colors: {
    emerald: THREE.Color;
    gold: THREE.Color;
    silver: THREE.Color;
  };
  physics: {
    lerpFactor: number;
    chaosRadius: number;
  };
  camera: {
    defaultPos: THREE.Vector3;
  };
}

export interface HandState {
  gesture: HandGesture;
  handPos: { x: number; y: number };
  isPresent: boolean;
}

export interface SceneRef {
  updatePolaroids: (imgs: HTMLImageElement[]) => void;
}

export interface OrnamentData {
  targetPos: THREE.Vector3;
  chaosPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  rotationAxis: THREE.Vector3;
  rotationSpeed: number;
}