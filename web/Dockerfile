FROM nginx:alpine

# 复制构建产物到 nginx 目录（由本地脚本先执行 npm ci / npm run build 产出 dist）
COPY dist /usr/share/nginx/html

# 复制 nginx 配置文件（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
