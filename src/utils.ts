// utils.ts
import * as THREE from 'three';
import { CONFIG } from './config';

export const generateTreeData = (count: number) => {
  const chaos = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const randoms = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const r = CONFIG.physics.chaosRadius * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    chaos[i * 3 + 2] = r * Math.cos(phi);

    const h = Math.random() * 20 - 10;
    const normalizedH = (h + 10) / 20;
    const maxR = 9 * (1.0 - normalizedH);
    const spiralAngle = i * 0.1;
    const radius = maxR * Math.sqrt(Math.random());

    target[i * 3] = radius * Math.cos(spiralAngle + h * 2);
    target[i * 3 + 1] = h;
    target[i * 3 + 2] = radius * Math.sin(spiralAngle + h * 2);

    sizes[i] = Math.random() * 0.5 + 0.2;
    randoms[i] = Math.random();
  }
  return { chaos, target, sizes, randoms };
};

export const createPolaroidTexture = (customImage?: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#fdfdfd';
  ctx.fillRect(0, 0, 256, 300);

  if (customImage) {
    const aspect = customImage.width / customImage.height;
    let drawW = 224, drawH = 224, offX = 16, offY = 16;
    if (aspect > 1) {
      drawW = 224 * aspect;
      offX = 16 - (drawW - 224) / 2;
    } else {
      drawH = 224 / aspect;
      offY = 16 - (drawH - 224) / 2;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(16, 16, 224, 224);
    ctx.clip();
    ctx.drawImage(customImage, offX, offY, drawW, drawH);
    ctx.restore();
  } else {
    const hue = Math.random() * 360;
    const grad = ctx.createLinearGradient(0, 0, 256, 300);
    grad.addColorStop(0, `hsla(${hue}, 60%, 50%, 1)`);
    grad.addColorStop(1, `hsla(${hue + 40}, 60%, 30%, 1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(16, 16, 224, 224);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const createGiftTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#8B0000');
  grad.addColorStop(1, '#B22222');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const ribbonWidth = 60;
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.fillRect(256 - ribbonWidth / 2, 0, ribbonWidth, 512);
  ctx.fillRect(0, 256 - ribbonWidth / 2, 512, ribbonWidth);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(256 - ribbonWidth / 2 + 10, 0, 10, 512);
  ctx.fillRect(0, 256 - ribbonWidth / 2 + 10, 512, 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};