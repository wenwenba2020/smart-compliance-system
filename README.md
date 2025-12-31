# 智能合规审核系统 MVP

## 项目概述

基于语义理解的合规审核系统，实现审核角色-单据类型-法规条款的智能关联匹配。

## 功能特性

- 法规文档自动解析和条款抽取
- 审核角色和单据类型管理
- 基于规则的条款匹配查询
- RESTful API接口

## 技术栈

- **后端框架**: FastAPI
- **数据库**: SQLite
- **ORM**: SQLAlchemy
- **Python版本**: 3.8+

## 项目结构

```
smart_compliance/
├── backend/
│   ├── app.py              # FastAPI应用主文件
│   ├── database.py         # 数据库模型和连接
│   ├── parser.py           # 法规文档解析器
│   ├── matcher.py          # 条款匹配逻辑
│   ├── init_data.py        # 数据初始化脚本
│   ├── data/
│   │   └── compliance.db   # SQLite数据库
│   └── requirements.txt
├── regulations/            # 法规文档目录
└── README.md
```

## 功能亮点

### 🎯 核心功能
1. **条款智能匹配**：根据审核角色和单据类型自动匹配相关法规条款
2. **关键词搜索**：快速搜索所有法规中包含特定关键词的条款
3. **AI模型配置**：支持配置Embedding和LLM模型，提升智能审核能力

### ⭐ 最新功能
4. **法规文件上传**：
   - 支持PDF和Word文档（.pdf, .docx, .doc）
   - 自动解析文档内容，提取法规条款
   - 智能识别"第X条"格式
   - 文件大小限制10MB
   - 详见：[文件上传功能说明.md](文件上传功能说明.md)

## 快速开始

### 1. 安装依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 初始化数据库

```bash
python init_data.py
```

### 3. 启动服务

```bash
uvicorn app:app --reload --port 10000
```

### 4. 访问API

- API文档: http://localhost:10000/docs
- 查询接口: http://localhost:10000/api/match?role=商务管理员&document_type=采购招标/比选/谈判/评审结论建议

## API端点

### GET /api/match
查询匹配的法规条款

参数:
- `role`: 审核角色名称
- `document_type`: 单据类型名称

### GET /api/roles
获取所有审核角色列表

### GET /api/document-types
获取所有单据类型列表

### POST /api/regulations/upload ⭐ 新增
上传法规文档

支持:
- PDF文档（.pdf）
- Word文档（.doc, .docx）

示例:
```bash
curl -X POST "http://localhost:10000/api/regulations/upload" \
     -F "file=@法规文档.pdf"
```

## 开发进度

- [x] 项目初始化
- [x] 数据库模型创建
- [x] 法规文档解析
- [x] 示例数据导入
- [x] 匹配逻辑实现
- [x] API接口开发
- [x] 功能测试

## 测试结果

系统已成功导入：
- **6个法规文档**，共427条法规条款
- **2个审核角色**：商务管理员、厂领导
- **1个单据类型**：采购招标/比选/谈判/评审结论建议
- **4条审核规则**：角色-单据-条款的关联关系

测试验证：
- ✅ 商务管理员审核采购招标单据：返回2条相关法规条款
- ✅ 厂领导审核采购招标单据：返回2条不同的相关法规条款
- ✅ 关键词搜索功能正常
- ✅ 所有API端点响应正常

## 前端应用

前端应用已开发完成！

### 启动前端
```bash
cd frontend
npm install  # 首次运行
npm run dev
```

访问：http://localhost:3000

### 前端功能
- ✅ 条款匹配查询（首页）
- ✅ 关键词搜索
- ✅ 法规浏览
- ✅ **法规文件上传**（支持PDF和Word文档）⭐
- ✅ AI模型配置（Embedding + LLM）
- ✅ 审核角色管理
- ✅ 单据类型管理
- ✅ **审核规则管理**（可视化关系图）⭐ 新增

### 设计特点
- 极简风格，参考danduola.ai设计
- 完整的AI模型配置界面
- 支持多种Embedding和LLM模型
- 三种匹配策略可选

详细信息请查看：[前端开发完成报告.md](前端开发完成报告.md)

## 下一步计划

1. **完善审核规则管理**：实现规则的增删改查
2. **集成向量检索**：对接Embedding模型进行语义匹配
3. **集成LLM推荐**：使用大语言模型提供智能建议
4. **数据导出功能**：生成审核报告
