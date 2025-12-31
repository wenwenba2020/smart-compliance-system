#!/bin/bash

# GitHub Pages 部署脚本
# 用法: ./deploy-gh-pages.sh

echo "开始构建前端..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "错误: 前端构建失败"
    exit 1
fi

echo "构建成功！"
echo ""
echo "创建gh-pages分支并部署..."
cd ..

# 保存当前分支
current_branch=$(git branch --show-current)

# 创建或切换到gh-pages分支
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages

# 清空工作目录
git rm -rf .
rm -rf *
rm -rf .*
git clean -fdx

# 复制构建文件
cp -r frontend/out/* .

# 添加.nojekyll文件（告诉GitHub Pages不要使用Jekyll）
touch .nojekyll

# 提交并推送
git add .
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
git push -f origin gh-pages

echo ""
echo "✅ 部署完成！"
echo ""
echo "现在请在GitHub上配置Pages："
echo "1. 访问: https://github.com/wenwenba2020/smart-compliance-system/settings/pages"
echo "2. Source选择 'gh-pages' 分支"
echo "3. 点击Save"
echo ""
echo "部署地址将会是: https://wenwenba2020.github.io/smart-compliance-system"
echo ""

# 切回原分支
git checkout $current_branch
