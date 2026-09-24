# Semiconductor Test Laboratory

- Module 01 — What is semiconductor test?
- Module 02 — How is a DUT connected to an ATE?

本地 3D 教学模拟：帮助学生理解 DUT **不是**直接插在 ATE 主机上，而是：

**ATE / Tester Channel → Load Board → Socket → DUT Pin**

## 项目文件结构

```text
ic_fundamental/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── lab/LabShell.tsx
    └── modules/
        ├── catalog.ts
        ├── module00/          # 产业与概念
        └── module01/          # 3D 物理连接
        ├── Module01Page.tsx
        ├── Scene.tsx
        ├── hooks/useAssembly.ts
        ├── data/layout.ts
        └── components/
            ├── ATE.tsx
            ├── LoadBoard.tsx
            ├── Socket.tsx
            ├── DUT.tsx
            ├── ChannelInterface.tsx
            └── SceneLabel.tsx
```

## 已实现功能（第一阶段）

- Vite + React + TypeScript + Three.js（React Three Fiber / drei）
- FT / CP 两种测试连接可切换，上下方向相反
- FT：DUT 在上，ATE 在下。Socket 坐在 Load Board 顶面，底部 pin 插入顶面焊盘
- CP：ATE 在上，Wafer 在下。圆形 Probe Card，底面焊盘对接 Needle 上触点；晶圆为 die 阵列 + 直线定位边（primary flat）
- 16 个 Tester Channel 视觉占位，以及 Channel → 接口板 Connector 的接口柱（不直连 DUT）
- Load Board：PCB 厚度、安装孔、Connector、Socket 焊盘/过孔、3D 走线、PWR/GND、少量元件
- OrbitControls：左键旋转、滚轮缩放、右键平移
- Explode / Assemble：约 1 秒平滑插值，只拉开间距，不颠倒上下顺序

## 如何运行

```powershell
cd D:\liang\source\ic_fundamental
npm install
npm run dev
```

浏览器打开终端提示的本地地址（通常是 `http://localhost:5173`）。

## 下一步建议

1. 点击选择部件 + 右侧 Component Information
2. 建立 16 路 CH → NET → CONTACT → Ball 数据关系
3. Pin Selection 与整条路径高亮
4. Show Signal Path 动画
5. 二维 Connection Diagram 与 3D 联动
6. Guided Tour
7. Top / Front / Isometric / Reset Camera

第一阶段刻意未实现：Waveform、Test Pattern、Timing、PASS/FAIL、登录、后端。
