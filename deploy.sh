#!/bin/bash

# BayCard 一鍵部署腳本
# 支持 Vercel、Netlify、Docker 部署

set -e

echo "🚀 BayCard 自動部署工具"
echo "========================"
echo ""
echo "選擇部署方案："
echo "1. Vercel（推薦）"
echo "2. Netlify"
echo "3. Docker"
echo "4. 本地開發"
echo ""
read -p "請選擇 (1-4): " choice

case $choice in
  1)
    echo ""
    echo "📦 準備部署到 Vercel..."
    echo ""
    echo "前置要求："
    echo "1. 已安裝 Vercel CLI: npm i -g vercel"
    echo "2. 已登入 Vercel: vercel login"
    echo ""
    read -p "按 Enter 繼續..."
    
    echo ""
    echo "🔧 安裝依賴..."
    pnpm install
    
    echo ""
    echo "🏗️  構建項目..."
    pnpm build
    
    echo ""
    echo "📤 部署到 Vercel..."
    vercel --prod
    
    echo ""
    echo "✅ 部署完成！"
    echo "訪問你的應用："
    vercel inspect
    ;;
    
  2)
    echo ""
    echo "📦 準備部署到 Netlify..."
    echo ""
    echo "前置要求："
    echo "1. 已安裝 Netlify CLI: npm i -g netlify-cli"
    echo "2. 已登入 Netlify: netlify login"
    echo ""
    read -p "按 Enter 繼續..."
    
    echo ""
    echo "🔧 安裝依賴..."
    pnpm install
    
    echo ""
    echo "🏗️  構建項目..."
    pnpm build
    
    echo ""
    echo "📤 部署到 Netlify..."
    netlify deploy --prod --dir=dist
    
    echo ""
    echo "✅ 部署完成！"
    ;;
    
  3)
    echo ""
    echo "📦 準備 Docker 部署..."
    echo ""
    echo "前置要求："
    echo "1. 已安裝 Docker"
    echo "2. 已安裝 Docker Compose（可選）"
    echo ""
    
    read -p "輸入 Docker 鏡像名稱 (預設: baycard:latest): " image_name
    image_name=${image_name:-baycard:latest}
    
    echo ""
    echo "🔧 構建 Docker 鏡像..."
    docker build -t $image_name .
    
    echo ""
    echo "✅ Docker 鏡像已構建！"
    echo ""
    echo "運行容器："
    echo "docker run -d -p 3000:3000 \\"
    echo "  -e DATABASE_URL=\"<你的資料庫 URL>\" \\"
    echo "  -e JWT_SECRET=\"<你的 JWT 密鑰>\" \\"
    echo "  -e VITE_APP_ID=\"<OAuth App ID>\" \\"
    echo "  $image_name"
    echo ""
    
    read -p "是否立即運行容器？(y/n): " run_container
    if [ "$run_container" = "y" ]; then
      echo ""
      echo "📝 輸入環境變數..."
      read -p "DATABASE_URL: " db_url
      read -p "JWT_SECRET: " jwt_secret
      read -p "VITE_APP_ID: " app_id
      
      echo ""
      echo "🚀 啟動容器..."
      docker run -d -p 3000:3000 \
        -e DATABASE_URL="$db_url" \
        -e JWT_SECRET="$jwt_secret" \
        -e VITE_APP_ID="$app_id" \
        $image_name
      
      echo ""
      echo "✅ 容器已啟動！"
      echo "訪問應用: http://localhost:3000"
    fi
    ;;
    
  4)
    echo ""
    echo "🔧 本地開發環境設置..."
    echo ""
    
    echo "📦 安裝依賴..."
    pnpm install
    
    echo ""
    echo "🚀 啟動開發伺服器..."
    pnpm dev
    ;;
    
  *)
    echo "❌ 無效的選擇"
    exit 1
    ;;
esac

echo ""
echo "🎉 完成！"
