# 粒子物理 WebGL 模拟器

基于 Three.js 和 React Three Fiber 的 3D 粒子物理模拟器，支持重力、碰撞、流体、漩涡四种模式。

## 功能

- 4 种物理模式：重力吸引、弹性碰撞、流体模拟（SPH）、漩涡旋转
- 4 个预设场景：太阳系、台球碰撞、熔岩灯、龙卷风
- 实时参数调节：重力、阻尼、弹性、吸引力
- InstancedMesh GPU 加速渲染（最高 800 粒子）
- 慢动作模式 & 暂停/重置
- FPS / 动能实时统计

## 技术栈

- React + TypeScript + Vite
- Three.js + @react-three/fiber + @react-three/drei
- Zustand（状态管理）
- Tailwind CSS

## 运行

```bash
cd frontend && npm install && npm run dev
```
