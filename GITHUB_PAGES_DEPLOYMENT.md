# GitHub Pages 部署指南

## 项目已托管到GitHub

**仓库地址**: https://github.com/wenwenba2020/smart-compliance-system

---

## 重要说明

### GitHub Pages 限制

GitHub Pages **只能托管静态网站**（HTML/CSS/JavaScript），**不能运行后端服务**。

因此，我们的部署方案是：

### 📦 部署架构

```
┌──────────────────┐         ┌──────────────────┐
│   GitHub Pages   │   →     │   后端API服务     │
│   (前端静态网站)  │  调用   │   (需单独部署)    │
│   公网可访问      │         │                  │
└──────────────────┘         └──────────────────┘
```

---

## 🚀 部署步骤

### 方案一：推荐方案（完整部署）

#### 1. 前端部署到GitHub Pages

**准备静态导出**:
```bash
cd frontend

# 添加静态导出配置
echo "const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig" > next.config.js

# 构建静态网站
npm run build
```

生成的静态文件在 `frontend/out` 目录。

**推送到GitHub Pages**:
```bash
# 创建gh-pages分支
git checkout -b gh-pages

# 只保留out目录的内容
cp -r frontend/out/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

**在GitHub上配置**:
1. 访问仓库设置: https://github.com/wenwenba2020/smart-compliance-system/settings/pages
2. Source选择 `gh-pages` 分支
3. 点击Save

#### 2. 后端部署到Vercel（推荐）

**Vercel特点**:
- 免费部署
- 支持Python/FastAPI
- 自动HTTPS
- 全球CDN

**步骤**:
1. 访问 https://vercel.com
2. 使用GitHub登录
3. Import项目: wenwenba2020/smart-compliance-system
4. 配置根目录为 `backend`
5. 添加环境变量（如需要）
6. 部署

**获取API地址**:
部署后会得到类似: `https://your-project.vercel.app`

#### 3. 配置前端API地址

修改 `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

重新构建前端并部署。

---

### 方案二：简化方案（仅前端）

如果只想展示前端界面：

1. **模拟API响应**
   - 使用Mock数据
   - 前端展示功能演示

2. **部署到GitHub Pages**
   - 按照上述前端部署步骤
   - API调用会失败，但界面可访问

---

## 🌐 后端部署选项

### 选项1: Vercel（推荐）
- ✅ 免费
- ✅ 简单易用
- ✅ 自动部署
- ✅ 支持Python

**步骤**: 见上文

### 选项2: Railway
- ✅ 免费$5/月额度
- ✅ 支持数据库
- ✅ 容器部署

**步骤**:
1. 访问 https://railway.app
2. 连接GitHub仓库
3. 配置环境变量
4. 部署

### 选项3: 自己的服务器
- ✅ 完全控制
- ✅ 无限制

**步骤**:
```bash
# 在服务器上
git clone https://github.com/wenwenba2020/smart-compliance-system.git
cd smart-compliance-system/backend
pip install -r requirements.txt
python init_data.py
uvicorn app:app --host 0.0.0.0 --port 10000
```

配置Nginx反向代理和SSL证书。

---

## 📝 完整部署检查清单

### 前端
- [ ] 配置静态导出 (next.config.js)
- [ ] 设置API地址环境变量
- [ ] 构建静态文件 (npm run build)
- [ ] 推送到gh-pages分支
- [ ] 在GitHub Settings配置Pages

### 后端
- [ ] 选择部署平台
- [ ] 配置环境变量
- [ ] 部署API服务
- [ ] 测试API端点
- [ ] 获取公网API地址

### 集成
- [ ] 更新前端API地址
- [ ] 重新构建前端
- [ ] 测试前后端连接
- [ ] 确认所有功能正常

---

## 🔧 Next.js 静态导出配置

创建 `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 如果部署到子路径，取消注释下面的行
  // basePath: '/smart-compliance-system',
  // assetPrefix: '/smart-compliance-system',
}

module.exports = nextConfig
```

---

## 🌍 访问地址

部署完成后：

- **前端**: https://wenwenba2020.github.io/smart-compliance-system
- **后端**: 根据选择的部署平台而定

---

## 🛠️ 常见问题

### Q: GitHub Pages 显示404

**A**: 检查以下几点：
1. 确认gh-pages分支存在
2. Settings → Pages 中Source选择正确
3. 等待几分钟让GitHub处理

### Q: API调用失败

**A**: 
1. 确认后端已部署并运行
2. 检查前端API地址配置
3. 确认CORS设置正确
4. 查看浏览器控制台错误

### Q: 样式不正常

**A**:
1. 确认 `images.unoptimized: true`
2. 检查basePath配置
3. 清除缓存重新构建

---

## 📚 相关资源

- GitHub Pages 文档: https://docs.github.com/pages
- Next.js 静态导出: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- Vercel 部署: https://vercel.com/docs
- FastAPI 部署: https://fastapi.tiangolo.com/deployment/

---

**更新日期**: 2025-12-31  
**仓库**: https://github.com/wenwenba2020/smart-compliance-system
