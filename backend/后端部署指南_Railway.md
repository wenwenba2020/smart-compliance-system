# 🚂 Railway后端部署指南

## 为什么需要部署后端？

GitHub Pages只能托管静态网站（HTML/CSS/JS），不能运行Python后端。

**当前架构问题**：
```
GitHub Pages (前端) ✅ → 尝试连接 → localhost:10000 (后端) ❌
```

**部署后架构**：
```
GitHub Pages (前端) ✅ → 连接成功 → Railway (后端) ✅
```

---

## Railway部署优势

✅ **零配置部署** - 自动检测Python项目  
✅ **免费额度** - $5免费额度，足够MVP使用  
✅ **自动HTTPS** - 自动配置SSL证书  
✅ **SQLite支持** - 支持数据持久化（需配置Volume）  
✅ **GitHub集成** - 推送代码自动部署  
✅ **5分钟上线** - 最快的部署方案

---

## 📋 部署步骤

### 1️⃣ 准备工作（已完成）

已创建的配置文件：
- ✅ `Procfile` - 启动命令
- ✅ `runtime.txt` - Python版本
- ✅ `railway.toml` - Railway配置
- ✅ `requirements.txt` - 依赖包

### 2️⃣ 注册Railway账号

1. 访问：https://railway.app
2. 点击 "Start a New Project"
3. 使用GitHub账号登录（推荐）

### 3️⃣ 创建新项目

#### 方法A：从GitHub仓库部署（推荐）⭐

1. **推送backend配置到GitHub**
   ```bash
   cd /Users/robertzf/smart_compliance
   git add backend/Procfile backend/runtime.txt backend/railway.toml
   git commit -m "feat: 添加Railway部署配置"
   git push origin main
   ```

2. **在Railway创建项目**
   - 点击 "Deploy from GitHub repo"
   - 选择 `wenwenba2020/smart-compliance-system`
   - Root Directory: `/backend`
   - 点击 "Deploy Now"

#### 方法B：使用Railway CLI

```bash
# 1. 安装Railway CLI
npm install -g @railway/cli

# 或使用brew
brew install railway

# 2. 登录
railway login

# 3. 进入backend目录
cd /Users/robertzf/smart_compliance/backend

# 4. 初始化项目
railway init

# 5. 部署
railway up
```

### 4️⃣ 配置数据库持久化（重要！）

SQLite需要持久化存储：

1. 在Railway项目中，点击 "Variables"
2. 添加环境变量：
   ```
   DATABASE_PATH=/data/compliance.db
   ```

3. 点击 "Settings" → "Volumes"
4. 添加Volume：
   - Mount Path: `/data`
   - Size: 1GB（免费）

5. 修改 `backend/database.py`：
   ```python
   import os
   
   # 生产环境使用环境变量指定的路径
   db_path = os.getenv('DATABASE_PATH', './data/compliance.db')
   DATABASE_URL = f"sqlite:///{db_path}"
   ```

### 5️⃣ 初始化数据库

部署后，需要初始化数据库：

**方法1：使用Railway CLI（推荐）**
```bash
railway run python init_data.py
```

**方法2：添加初始化脚本**
创建 `backend/start.sh`：
```bash
#!/bin/bash
# 检查数据库是否存在
if [ ! -f "$DATABASE_PATH" ]; then
    echo "Initializing database..."
    python init_data.py
fi

# 启动应用
uvicorn app:app --host 0.0.0.0 --port $PORT
```

更新 `railway.toml`：
```toml
[deploy]
startCommand = "bash start.sh"
```

### 6️⃣ 获取后端URL

部署成功后：
1. Railway会生成一个公网URL，如：
   ```
   https://smart-compliance-production.up.railway.app
   ```
2. 复制这个URL

### 7️⃣ 更新前端配置

**方法A：环境变量（推荐）**

创建 `frontend/.env.production`：
```env
NEXT_PUBLIC_API_URL=https://smart-compliance-production.up.railway.app
```

**方法B：直接修改代码**

修改 `frontend/lib/api.ts`：
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'production' 
        ? 'https://smart-compliance-production.up.railway.app'  // 生产环境
        : 'http://localhost:10000')  // 开发环境
```

### 8️⃣ 重新部署前端

```bash
cd /Users/robertzf/smart_compliance

# 1. 设置环境变量（临时）
export NEXT_PUBLIC_API_URL=https://smart-compliance-production.up.railway.app

# 2. 重新构建
cd frontend
npm run build

# 3. 部署到GitHub Pages
cd ..
bash deploy-gh-pages.sh
```

---

## 🔍 验证部署

### 测试后端

```bash
# 健康检查
curl https://your-app.up.railway.app/health

# 测试API
curl "https://your-app.up.railway.app/api/roles"
```

### 测试前端

访问：https://wenwenba2020.github.io/smart-compliance-system

应该能看到：
- ✅ 角色下拉菜单有数据
- ✅ 单据类型下拉菜单有数据
- ✅ 法规库显示法规列表
- ✅ 搜索功能正常

---

## ⚙️ Railway配置建议

### CORS设置

确保 `backend/app.py` 有正确的CORS配置：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://wenwenba2020.github.io",  # GitHub Pages
        "http://localhost:3000",  # 本地开发
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 环境变量

在Railway中设置：
```
DATABASE_PATH=/data/compliance.db
PORT=8000  # Railway会自动设置
PYTHON_VERSION=3.11
```

---

## 💰 费用估算

Railway免费额度：
- **$5免费额度** / 月
- **500小时执行时间**
- **100GB出站流量**

您的MVP应用：
- **预计消耗**：$1-2 / 月
- **足够**支持开发和小规模测试

---

## 🐛 常见问题

### Q1: 部署后数据库为空？
**A**: 需要运行初始化脚本 `python init_data.py`

### Q2: Railway重启后数据丢失？
**A**: 需要配置Volume持久化存储

### Q3: API返回CORS错误？
**A**: 检查 `app.py` 的CORS配置，确保包含GitHub Pages域名

### Q4: 如何查看日志？
**A**: Railway Dashboard → 项目 → "Logs" 标签

### Q5: 如何更新代码？
**A**: 
- GitHub部署：推送到main分支自动更新
- CLI部署：运行 `railway up`

---

## 📊 部署后架构

```
┌─────────────────────────────────────────────┐
│  用户浏览器                                  │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│  GitHub Pages                                │
│  https://wenwenba2020.github.io/...         │
│  • 静态HTML/CSS/JS                          │
│  • 前端界面                                  │
└────────────┬────────────────────────────────┘
             │
             │ fetch API
             ↓
┌─────────────────────────────────────────────┐
│  Railway                                     │
│  https://your-app.up.railway.app            │
│  • Python FastAPI                           │
│  • SQLite数据库                             │
│  • 业务逻辑                                  │
└─────────────────────────────────────────────┘
```

---

## ✅ 部署清单

- [ ] 创建Railway账号
- [ ] 推送配置文件到GitHub
- [ ] 在Railway创建项目并连接GitHub仓库
- [ ] 配置Volume持久化
- [ ] 等待自动部署完成
- [ ] 运行数据库初始化
- [ ] 获取后端URL
- [ ] 更新前端API配置
- [ ] 重新构建并部署前端
- [ ] 测试所有功能

---

## 🎯 预计时间

- Railway注册和配置：5分钟
- 后端部署：3-5分钟
- 数据库初始化：2分钟
- 前端重新部署：5分钟

**总计：15-20分钟** ⏱️

---

## 📞 需要帮助？

如果您决定部署，我可以：
1. 帮您修改代码以支持生产环境
2. 提供详细的Railway配置步骤
3. 协助调试部署问题

只需告诉我您准备好了！🚀
