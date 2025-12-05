// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ThreeScene } from './ThreeScene';
import { MediaPipeManager } from './MediaPipeManager';
import { handState } from './config';
import { SceneRef } from './types';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [debugText, setDebugText] = useState('初始化系统...');
  const [showUI, setShowUI] = useState(true);
  const sceneRef = useRef<SceneRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      let label = '等待手势...';
      if (handState.gesture === 'GUN') label = '检测到: 手枪 (查看照片)';
      else if (handState.gesture === 'FIST') label = '检测到: 五指聚合 (复原)';
      else if (handState.gesture === 'OPEN') label = '检测到: 张手 (释放)';
      setDebugText(label);
    }, 200);
    return () => clearInterval(t);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && sceneRef.current) {
      const fileList = Array.from(files).slice(0, 5);
      const images: HTMLImageElement[] = [];
      let loadedCount = 0;

      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.src = evt.target?.result as string;
          img.onload = () => {
            images.push(img);
            loadedCount++;
            if (loadedCount === fileList.length) {
              sceneRef.current?.updatePolaroids(images);
            }
          };
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error("Fullscreen failed:", e);
      });
      setShowUI(false);
    } else {
      setShowUI(!showUI);
    }
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    if (!showUI) {
      setShowUI(true);
    }
  };

  return (
    <div
      className="w-full h-screen bg-black relative overflow-hidden font-sans"
      onClick={handleScreenClick}
    >
      <MediaPipeManager onLoad={() => setLoaded(true)} />
      <ThreeScene ref={sceneRef} />

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-50 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
          <div className="pointer-events-auto">
            <h1 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-lg tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
              MERRY CHRISTMAS
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-green-800 to-green-600 mt-2"></div>
            <p className="text-yellow-100/80 mt-2 font-light tracking-wider text-sm">
              圣诞快乐 · LUXURY INTERACTIVE EXPERIENCE
            </p>
          </div>

          <div className="text-right pointer-events-auto flex flex-col items-end gap-2">
            <div className={`px-4 py-2 border border-yellow-500/30 bg-black/40 backdrop-blur-md text-yellow-100 font-mono text-xs transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-50'}`}>
              AI 视觉: {loaded ? '在线' : '加载中...'}
            </div>
            <div className="text-emerald-400 font-mono text-xs mb-2">
              {debugText}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/50 text-yellow-200 text-xs font-serif tracking-widest transition-all uppercase backdrop-blur-sm cursor-pointer"
            >
              上传回忆 (最多5张) 📸
            </button>

            <button
              onClick={toggleFullscreen}
              className="mt-2 px-4 py-2 bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-500/30 text-emerald-100 text-xs font-serif tracking-widest transition-all uppercase backdrop-blur-sm cursor-pointer flex items-center gap-2"
            >
              <span>✨ 全屏沉浸</span>
            </button>

            <p className="text-yellow-100/40 text-[10px] max-w-[150px] text-right">
              提示：上传后使用"L型手势"即可轮播查看您的照片。
            </p>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-auto z-10">
          <div className="flex gap-8 text-yellow-100/60 text-sm font-light tracking-widest bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/5">
            <span className="flex flex-col items-center gap-1">
              <span className="text-2xl">🖐</span>
              <span>张开五指 (释放)</span>
            </span>
            <span className="flex flex-col items-center gap-1">
              <span className="text-2xl">👌</span>
              <span>五指聚合 (复原)</span>
            </span>
            <span className="flex flex-col items-center gap-1">
              <span className="text-2xl rotate-90 inline-block">👆</span>
              <span>L型手势 (检视照片)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}