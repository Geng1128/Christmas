// config.ts
import * as THREE from 'three';
import { Config, HandState } from './types';

export const CONFIG: Config = {
  particleCount: 20000,
  colors: {
    emerald: new THREE.Color('#004225'),
    gold: new THREE.Color('#FFD700'),
    silver: new THREE.Color('#C0C0C0'),
  },
  physics: {
    lerpFactor: 0.05,
    chaosRadius: 25,
  },
  camera: {
    defaultPos: new THREE.Vector3(0, 2, 22),
  }
};

export const handState: HandState = {
  gesture: 'NONE',
  handPos: { x: 0, y: 0 },
  isPresent: false,
};