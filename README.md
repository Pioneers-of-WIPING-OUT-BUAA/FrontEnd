# 扫荡北航先锋-前端

本项目是"扫荡北航"机器人项目的前端用户界面，基于 Vue 3 和 ROS (Robot Operating System) 构建。用户可以通过此界面实时监控机器人状态、进行地图交互和下达控制指令。

---

## 一、 主要功能

本前端应用旨在提供一个功能全面、操作直观的机器人交互界面。主要功能模块如下：

1.  **用户登录与权限管理**：提供安全的登录入口，未来可扩展支持多用户和权限分级。
2.  **机器人状态监控**：
    - **实时地图显示**：通过 `ros2d.js` 库实时渲染来自 ROS 的地图数据 (`nav_msgs/OccupancyGrid`)。
    - **机器人姿态显示**：在地图上实时更新机器人的位置和朝向。
    - **Kinect 数据可视化**：展示来自 Kinect 传感器的深度信息或图像。
3.  **地图交互**：
    - **地图标点**：允许用户在地图上选择并标记兴趣点（Point of Interest）。
    - **导航目标设定**：通过在地图上点击来设定机器人的导航目标点。
4.  **远程控制与任务下发**：
    - **模式切换**：提供界面来切换机器人的工作模式（如：建图、导航、待机）。
    - **手动控制**：提供虚拟摇杆或控制按钮，用于手动遥控机器人。
5.  **系统日志与通知**：实时显示来自机器人系统和前端应用的日志信息及状态通知。

## 二、 ROS 通信机制

前端通过 WebSocket 与 ROS Master 进行通信，依赖于在机器人端部署的 `rosbridge_server`。

- **通信协议**：`rosbridge` v2.0 协议。
- **核心库**：使用 `roslib.js` 库来封装 WebSocket 连接、实现 ROS 话题（Topic）的发布/订阅以及服务（Service）的调用。
- **连接管理**：
  - 项目的核心通信逻辑位于 `src/stores/wsStore.ts`。
  - 该文件使用 Pinia 创建了一个全局状态 `wsStore`，用于管理与 `rosbridge` 的 WebSocket 连接实例。
  - 它封装了 `connect` 和 `disconnect` 方法，并在应用的生命周期中维护唯一的 ROS 连接，供所有组件共享。
- **数据流**：
  - 各个 Vue 组件（如 `MapDisplay`, `NavDisplay`）从 `wsStore` 获取到 ROS 连接实例。
  - 组件根据自身功能，订阅相应的 ROS 话题（如 `/map`, `/odom`, `/tf` 等）以接收实时数据，或发布指令到特定的话题。

## 三、 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由**：Vue Router
- **UI 组件库**：Element Plus
- **ROS Web 库**：`roslib.js`
- **2D 可视化**：`ros2d.js`, `nav2d.js`

## 四、 开发与规范

### 1. 项目结构

```
src/
├── api/          # API 请求 (可用于与后端服务器通信)
├── assets/       # 静态资源 (图片, 样式)
├── components/   # 可复用组件 (如 rosBridge 下的各类显示组件)
├── stores/       # 全局状态管理 (Pinia stores, 如 wsStore)
├── views/        # 页面级组件 (应用的主要视图)
├── router/       # 路由配置
├── utils/        # 工具函数
├── App.vue       # 根组件
├── main.js       # 应用入口
└── style.css     # 全局样式
```

### 2. 环境要求

- **Node.js**: `v20.x` 或更高版本
- **pnpm**: 推荐使用 pnpm 作为包管理器

### 3. 开发流程

```bash
# 1. 克隆项目
git clone <repository-url>

# 2. 安装依赖
# 推荐使用 npm
npm install

# 3. 启动开发服务器
# 默认连接的 rosbridge 地址可在 src/stores/wsStore.ts 中修改
npm run dev

# 4. 构建项目
npm run build

# 5. 格式化代码
npm run format
```

### 4. 命名约定

| 类型      | 命名规则      | 示例            |
| --------- | ------------- | --------------- |
| 文件夹名  | 小写 + 中划线 | `user-profile`  |
| 组件名    | PascalCase    | `UserCard.vue`  |
| 函数/变量 | camelCase     | `getUserList()` |
| 路由名称  | 小写 + 中划线 | `/user-detail`  |
