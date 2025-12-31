#!/bin/bash

# 启动脚本 - 用于Railway等云平台部署
# 自动检查并初始化数据库

echo "🚀 Starting Smart Compliance System..."

# 检查数据库文件是否存在
DB_PATH="${DATABASE_PATH:-./data/compliance.db}"
echo "📂 Database path: $DB_PATH"

if [ ! -f "$DB_PATH" ]; then
    echo "📊 Database not found. Initializing..."
    python init_data.py
    if [ $? -eq 0 ]; then
        echo "✅ Database initialized successfully!"
    else
        echo "❌ Database initialization failed!"
        exit 1
    fi
else
    echo "✅ Database already exists, skipping initialization."
fi

# 启动FastAPI应用
echo "🌐 Starting FastAPI server on port ${PORT:-8000}..."
uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
