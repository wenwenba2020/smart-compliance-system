# 智能合规审核系统 - 前端应用

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks

## 功能特性

### 核心功能
- ✅ 条款匹配查询（首页）
- ✅ 关键词搜索
- ✅ 法规浏览
- ✅ AI模型配置（Embedding + LLM）
- ✅ 匹配策略选择

### 管理功能
- ✅ 审核角色管理
- ✅ 单据类型管理
- 🚧 审核规则管理（开发中）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:10000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
frontend/
├── app/                      # Next.js App Router页面
│   ├── layout.tsx            # 全局布局
│   ├── page.tsx              # 首页（条款匹配）
│   ├── search/               # 关键词搜索
│   ├── regulations/          # 法规浏览
│   ├── manage/               # 管理页面
│   │   ├── roles/            # 角色管理
│   │   ├── documents/        # 单据类型管理
│   │   └── rules/            # 审核规则管理
│   └── settings/             # 设置（AI配置）
├── components/
│   └── layout/
│       └── Sidebar.tsx       # 侧边栏导航
├── lib/
│   ├── api.ts                # API调用封装
│   └── utils.ts              # 工具函数
└── public/                   # 静态资源
```

## 页面说明

### 首页 - 条款匹配查询
- 选择审核角色和单据类型
- 点击查询按钮
- 查看匹配的法规条款列表

### 关键词搜索
- 输入关键词搜索
- 查看所有包含该关键词的条款
- 关键词高亮显示

### 法规浏览
- 查看所有法规文档列表
- 显示每个法规的条款数量

### 设置 - AI模型配置
- **Embedding模型配置**
  - 选择模型类型（OpenAI、本地、智谱AI等）
  - 填写API Key
  - 设置Base URL（可选）
  - 测试连接

- **LLM模型配置**
  - 选择模型（GPT-4、Claude、GLM-4等）
  - 填写API Key
  - 设置Base URL（可选）
  - 测试连接

- **匹配策略**
  - 仅规则匹配（当前）
  - 向量检索 + 规则匹配
  - LLM智能推荐

## API对接

前端通过 `lib/api.ts` 与后端API通信：

- `GET /api/match` - 条款匹配查询
- `GET /api/search` - 关键词搜索
- `GET /api/roles` - 获取审核角色
- `GET /api/document-types` - 获取单据类型
- `GET /api/regulations` - 获取法规列表

## 设计风格

- **极简风格**：清晰的视觉层次，最少的交互步骤
- **色彩方案**：
  - 主色：蓝色 (#2563EB)
  - 背景：白色 (#FFFFFF) / 浅灰 (#F8F9FA)
  - 文字：深灰 (#1F2937) / 中灰 (#6B7280)

## 开发说明

### API配置持久化
- API配置存储在浏览器localStorage中
- 不会上传到服务器，保证安全性

### 响应式设计
- 支持桌面和移动端
- 使用Tailwind CSS的响应式类

### 错误处理
- API调用失败时显示友好的错误提示
- 加载状态的loading动画

## 后续开发计划

### 近期
- [ ] 完善审核规则管理页面
- [ ] 添加条款详情弹窗
- [ ] 实现数据导出功能

### 中期
- [ ] 集成向量检索功能
- [ ] 集成LLM智能推荐
- [ ] 添加深色模式

### 长期
- [ ] 用户权限管理
- [ ] 审核历史记录
- [ ] 数据可视化

## 环境要求

- Node.js 18+
- npm 或 yarn

## 注意事项

1. 确保后端API服务已启动（端口10000）
2. API Key仅存储在本地浏览器，不会泄露
3. 建议先使用"仅规则匹配"测试系统

## 许可证

版本: 1.0.0 (MVP)
