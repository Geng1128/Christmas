// ThreeScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CONFIG, handState } from './config';
import { SceneRef, HandGesture, OrnamentData } from './types';
import { generateTreeData, createPolaroidTexture, createGiftTexture } from './utils';
import {
  foliageVertexShader,
  foliageFragmentShader,
  backgroundVertexShader,
  backgroundFragmentShader
} from './shaders';

export const ThreeScene = React.forwardRef<SceneRef>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePhotoIndexRef = useRef(0);
  const lastGestureRef = useRef<HandGesture>('NONE');
  const polaroidMeshesRef = useRef<THREE.Mesh[]>([]);
  const polaroidDataRef = useRef<OrnamentData[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x001a0d, 0.015);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.copy(CONFIG.camera.defaultPos);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;

    // Background Dome
    const bgGeo = new THREE.SphereGeometry(60, 32, 32);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      side: THREE.BackSide
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    scene.add(bgMesh);

    // Gold Dust
    const dustCount = 2000;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 80;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xFFD700,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.2);
    scene.add(ambient);
    const spotGold = new THREE.SpotLight(CONFIG.colors.gold, 200, 50, 0.5, 0.5);
    spotGold.position.set(10, 20, 10);
    scene.add(spotGold);
    const spotEmerald = new THREE.SpotLight(CONFIG.colors.emerald, 100, 50, 0.5, 0.5);
    spotEmerald.position.set(-10, 10, 5);
    scene.add(spotEmerald);
    const rimLight = new THREE.DirectionalLight('#ffffff', 1.0);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // Foliage
    const { chaos, target, sizes, randoms } = generateTreeData(CONFIG.particleCount);
    const foliageGeo = new THREE.BufferGeometry();
    foliageGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CONFIG.particleCount * 3), 3));
    foliageGeo.setAttribute('aChaosPos', new THREE.BufferAttribute(chaos, 3));
    foliageGeo.setAttribute('aTargetPos', new THREE.BufferAttribute(target, 3));
    foliageGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    foliageGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const foliageMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMix: { value: 0 },
      },
      vertexShader: foliageVertexShader,
      fragmentShader: foliageFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const foliage = new THREE.Points(foliageGeo, foliageMat);
    scene.add(foliage);

    // Ornaments
    const giftGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const giftMat = new THREE.MeshStandardMaterial({
      map: createGiftTexture(),
      roughness: 0.4,
      metalness: 0.4,
    });
    const gifts = new THREE.InstancedMesh(giftGeo, giftMat, 50);

    const baubleGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const baubleMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.gold, roughness: 0.0, metalness: 1.0 });
    const baubles = new THREE.InstancedMesh(baubleGeo, baubleMat, 150);

    const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const lightMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffaa', emissiveIntensity: 2.0 });
    const lights = new THREE.InstancedMesh(lightGeo, lightMat, 300);

    scene.add(gifts);
    scene.add(baubles);
    scene.add(lights);

    // Polaroids
    const polaroidsCount = 30;
    const polaroidGeo = new THREE.PlaneGeometry(1.2, 1.4);
    const polaroidMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < polaroidsCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: createPolaroidTexture(),
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(polaroidGeo, mat);
      scene.add(mesh);
      polaroidMeshes.push(mesh);
    }
    polaroidMeshesRef.current = polaroidMeshes;

    // Init Ornaments
    const initOrnaments = (count: number, radiusScale: number): OrnamentData[] => {
      const data: OrnamentData[] = [];
      for (let i = 0; i < count; i++) {
        const h = Math.random() * 16 - 8;
        const normH = (h + 10) / 20;
        const maxR = 9 * (1.0 - normH) * radiusScale;
        const angle = Math.random() * Math.PI * 2;
        const tx = maxR * Math.cos(angle);
        const tz = maxR * Math.sin(angle);

        const cr = 20 * Math.cbrt(Math.random());
        const cth = Math.random() * Math.PI * 2;
        const cph = Math.acos(2 * Math.random() - 1);
        const cx = cr * Math.sin(cph) * Math.cos(cth);
        const cy = cr * Math.sin(cph) * Math.sin(cth);
        const cz = cr * Math.cos(cph);

        data.push({
          targetPos: new THREE.Vector3(tx, h, tz),
          chaosPos: new THREE.Vector3(cx, cy, cz),
          currentPos: new THREE.Vector3(cx, cy, cz),
          rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
          rotationSpeed: Math.random() * 2.0
        });
      }
      return data;
    };

    const giftsData = initOrnaments(50, 0.9);
    const baublesData = initOrnaments(150, 1.0);
    const lightsData = initOrnaments(300, 1.05);
    const polaroidsData = initOrnaments(polaroidsCount, 1.1);
    polaroidDataRef.current = polaroidsData;

    const dummyObj = new THREE.Object3D();
    let stateMix = 0.0;
    let targetMix = 0.0;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (handState.gesture === 'GUN' && lastGestureRef.current !== 'GUN') {
        activePhotoIndexRef.current = (activePhotoIndexRef.current + 1) % polaroidsCount;
      }
      lastGestureRef.current = handState.gesture;

      if (handState.gesture === 'OPEN') targetMix = 0.0;
      else targetMix = 1.0;

      stateMix += (targetMix - stateMix) * CONFIG.physics.lerpFactor;

      if (handState.isPresent) {
        let targetCamX = handState.handPos.x * 5;
        let targetCamY = CONFIG.camera.defaultPos.y - handState.handPos.y * 5;
        let targetCamZ = camera.position.z;

        if (handState.gesture === 'FIST') {
          targetCamX = CONFIG.camera.defaultPos.x;
          targetCamY = CONFIG.camera.defaultPos.y;
          targetCamZ = CONFIG.camera.defaultPos.z;

          camera.position.x += (targetCamX - camera.position.x) * 0.2;
          camera.position.y += (targetCamY - camera.position.y) * 0.2;
          camera.position.z += (targetCamZ - camera.position.z) * 0.2;
        } else {
          camera.position.x += (targetCamX - camera.position.x) * 0.05;
          camera.position.y += (targetCamY - camera.position.y) * 0.05;
          camera.position.z += (targetCamZ - camera.position.z) * 0.05;
        }

        camera.lookAt(0, 0, 0);
      } else {
        controls.autoRotate = true;
        controls.update();
      }

      foliageMat.uniforms.uTime.value = time;
      foliageMat.uniforms.uMix.value = stateMix;
      bgMat.uniforms.uTime.value = time;
      dustParticles.rotation.y = time * 0.01;

      const updateGroup = (mesh: THREE.InstancedMesh, data: OrnamentData[], speed: number) => {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const dest = new THREE.Vector3().copy(item.chaosPos).lerp(item.targetPos, stateMix);
          item.currentPos.lerp(dest, speed);
          dummyObj.position.copy(item.currentPos);
          dummyObj.rotation.x = time * item.rotationSpeed;
          dummyObj.rotation.y = time * item.rotationSpeed;
          dummyObj.scale.setScalar(1.0);
          dummyObj.updateMatrix();
          mesh.setMatrixAt(i, dummyObj.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      };

      updateGroup(gifts, giftsData, 0.02);
      updateGroup(baubles, baublesData, 0.04);
      updateGroup(lights, lightsData, 0.06);

      for (let i = 0; i < polaroidMeshes.length; i++) {
        const mesh = polaroidMeshes[i];
        const item = polaroidsData[i];
        const dest = new THREE.Vector3().copy(item.chaosPos).lerp(item.targetPos, stateMix);

        if (i === activePhotoIndexRef.current && handState.gesture === 'GUN') {
          const cameraDir = new THREE.Vector3();
          camera.getWorldDirection(cameraDir);
          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
          const inspectPos = camera.position.clone()
            .add(cameraDir.multiplyScalar(6))
            .add(right.multiplyScalar(3));

          item.currentPos.lerp(inspectPos, 0.1);
          mesh.position.copy(item.currentPos);
          mesh.lookAt(camera.position);
          mesh.rotateY(Math.PI * 0.1);
          mesh.scale.setScalar(2.5);
        } else {
          item.currentPos.lerp(dest, 0.03);
          mesh.position.copy(item.currentPos);
          mesh.rotation.x = Math.sin(time + i) * 0.2;
          mesh.rotation.z = Math.cos(time * 0.8 + i) * 0.1;
          mesh.lookAt(camera.position);
          mesh.scale.setScalar(1.0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      foliageMat.dispose();
      foliageGeo.dispose();
      bgMat.dispose();
      bgGeo.dispose();
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    updatePolaroids: (imgs: HTMLImageElement[]) => {
      imgs.forEach((img, index) => {
        if (index < polaroidMeshesRef.current.length) {
          const mesh = polaroidMeshesRef.current[index];
          if (mesh) {
            const oldMat = mesh.material as THREE.MeshBasicMaterial;
            oldMat.map?.dispose();
            const newTex = createPolaroidTexture(img);
            mesh.material = new THREE.MeshBasicMaterial({
              map: newTex,
              side: THREE.DoubleSide
            });
            mesh.scale.setScalar(1.8);
            setTimeout(() => mesh.scale.setScalar(1.0), 400 + index * 100);
          }
        }
      });
    }
  }));

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black" />;
});