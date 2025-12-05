// MediaPipeManager.tsx
import { useEffect, useRef } from 'react';
import { handState } from './config';

interface MediaPipeManagerProps {
  onLoad: () => void;
}

export const MediaPipeManager = ({ onLoad }: MediaPipeManagerProps) => {
  const isInitRef = useRef(false); // 防止重复初始化
  const cameraRef = useRef<any>(null); // 保存 camera 实例以便清理
  const handsRef = useRef<any>(null);  // 保存 hands 实例以便清理

  useEffect(() => {
    // 如果已经初始化过，直接返回
    if (isInitRef.current) return;
    isInitRef.current = true;

    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(true);
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });
    };

    const init = async () => {
      try {
        console.log("Loading MediaPipe scripts...");
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        console.log("Scripts loaded.");

        const video = document.createElement('video');
        video.style.display = 'none';
        video.playsInline = true; // 关键：防止在移动端全屏
        document.body.appendChild(video);

        // @ts-ignore
        if (!window.Hands) {
           console.error("MediaPipe Hands script failed to load into window.");
           return;
        }

        // @ts-ignore
        const hands = new window.Hands({
          // @ts-ignore
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        handsRef.current = hands;

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1, // 1 是比较平衡的，0更快但不准
          minDetectionConfidence: 0.5, // 稍微降低一点以提高检出率
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          onLoad(); // 通知上层加载完成
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const lm = results.multiHandLandmarks[0];

            handState.isPresent = true;
            // 平滑处理建议在 ThreeScene 中做，这里直接传原始数据
            handState.handPos.x = -(lm[9].x - 0.5) * 2;
            handState.handPos.y = -(lm[9].y - 0.5) * 2;

            // --- 优化的手势识别逻辑 ---
            const dist = (i1: number, i2: number) => {
              const x = lm[i1].x - lm[i2].x;
              const y = lm[i1].y - lm[i2].y;
              const z = lm[i1].z - lm[i2].z;
              return Math.sqrt(x * x + y * y + z * z);
            };

            // 掌心基准大小 (腕部到中指根部)
            const palmSize = dist(0, 9);
            
            // 判断手指伸直 (指尖到手腕距离 > 指关节到手腕距离)
            // 增加 1.1 的系数作为容错
            const isStraight = (tip: number, mcp: number) => dist(tip, 0) > dist(mcp, 0) * 1.0; 
            
            // 拇指判断比较特殊，判断指尖是否远离小指根部
            const thumbStraight = dist(4, 17) > palmSize * 1.2;

            const indexStraight = isStraight(8, 5);
            const middleStraight = isStraight(12, 9);
            const ringStraight = isStraight(16, 13);
            const pinkyStraight = isStraight(20, 17);

            // 握拳判断：所有指尖都靠近手掌中心 (或者简单的都不伸直)
            const fingersFolded = !indexStraight && !middleStraight && !ringStraight && !pinkyStraight;
            
            // "GUN" 手势：拇指+食指伸直，其他弯曲
            const gun = thumbStraight && indexStraight && !middleStraight && !ringStraight && !pinkyStraight;
            
            // "OPEN" 手势：除了拇指外，其他四指必须伸直
            const open = indexStraight && middleStraight && ringStraight && pinkyStraight;

            if (gun) {
                handState.gesture = 'GUN';
            } else if (open) {
                handState.gesture = 'OPEN';
            } else if (fingersFolded) {
                handState.gesture = 'FIST';
            } else {
                handState.gesture = 'NONE';
            }
          } else {
            handState.isPresent = false;
            handState.gesture = 'NONE';
          }
        });

        // @ts-ignore
        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (handsRef.current) {
                await handsRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480
        });
        
        cameraRef.current = camera;
        camera.start();
        
      } catch (e) {
        console.error("MediaPipe Init Error:", e);
      }
    };

    init();

    // Cleanup 函数：组件卸载时停止摄像头
    return () => {
      console.log("Cleaning up MediaPipe...");
      if (cameraRef.current) {
          cameraRef.current.stop();
      }
      if (handsRef.current) {
          handsRef.current.close();
      }
      const video = document.querySelector('video');
      if (video) video.remove();
    };
  }, [onLoad]);

  return null;
};