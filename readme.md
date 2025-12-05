# 🎄 Interactive Christmas Tree Experience

一个基于 Three.js 和 MediaPipe 的交互式圣诞树体验项目，支持手势识别和照片上传功能。

## ✨ 功能特点

- 🌲 **3D 圣诞树**：使用粒子系统和 Shader 实现的动态圣诞树
- 🤚 **手势识别**：通过 MediaPipe 识别手势控制场景
  - 张开五指：释放粒子
  - 五指聚合：复原相机位置
  - L型手势：查看上传的照片
- 📸 **照片上传**：上传最多5张照片，并在场景中展示
- 🎨 **高级视觉效果**：背景 Shader、金色粉尘、动态光照

## 📁 项目结构

```
src/
├── types.ts              # TypeScript 类型定义
├── config.ts             # 全局配置和状态
├── shaders.ts            # GLSL Shader 代码
├── utils.ts              # 工具函数（纹理、几何体生成）
├── MediaPipeManager.tsx  # MediaPipe 手势识别组件
├── ThreeScene.tsx        # Three.js 场景组件
├── App.tsx               # 主应用组件
├── main.tsx              # React 入口
└── index.css             # 样式文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 📦 部署到 GitHub Pages

### 方法一：使用 GitHub Actions（推荐）

1. 在仓库根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. 在 `vite.config.ts` 中设置正确的 `base`：

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/你的仓库名/',  // 例如：'/christmas-tree/'
});
```

3. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

### 方法二：手动部署

```bash
npm run build
# 将 dist 文件夹内容上传到 GitHub Pages
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Three.js** - 3D 渲染
- **MediaPipe** - 手势识别
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具

## 🎮 使用说明

1. 打开网页后，允许相机权限
2. 等待 AI 视觉系统加载完成
3. 使用手势控制场景：
   - 🖐 张开五指：让粒子散开
   - 👌 五指聚合：复原相机到初始位置
   - 👆 L型手势：轮播查看上传的照片
4. 点击"上传回忆"按钮上传照片（最多5张）
5. 点击"全屏沉浸"获得更好的体验

## 📝 注意事项

- 需要 HTTPS 环境才能使用摄像头功能
- 建议使用现代浏览器（Chrome、Edge、Safari 等）
- 首次加载时需要下载 MediaPipe 模型，可能需要几秒钟

## 📄 License

MIT License

## 🎉 Merry Christmas!

祝你圣诞快乐！🎄✨