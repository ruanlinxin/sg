#!/usr/bin/env bash
set -euo pipefail

# 用法：
#   ./script/deploy.sh
#
# 可选环境变量：
#   SERVER_USER=ubuntu
#   SERVER_HOST=118.25.114.174
#   DEPLOY_TARGET_DIR=/opt/node/sg-server
#   SKIP_BUILD=0|1                     # 1 表示跳过本地构建，直接打包当前 dist/
#
# 其他：
#   KEEP_ARCHIVE=0|1                   # 1 表示本地/远端都保留 tar.gz（默认 0）

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

SERVER_USER="${SERVER_USER:-ubuntu}"
SERVER_HOST="${SERVER_HOST:-118.25.114.174}"
DEPLOY_TARGET_DIR="${DEPLOY_TARGET_DIR:-/opt/node/sg-server}"

SKIP_BUILD="${SKIP_BUILD:-0}"
KEEP_ARCHIVE="${KEEP_ARCHIVE:-0}"

DIST_ARCHIVE_NAME="dist.tar.gz"

cd "${PROJECT_ROOT}"

if [[ "${SKIP_BUILD}" != "1" ]]; then
  echo "[1/5] 本地构建 dist（需要本机已安装 Node.js/npm）"
  if ! command -v npm >/dev/null 2>&1; then
    echo "未找到 npm，请先安装 Node.js（或设置 SKIP_BUILD=1 并确保已有 dist/）"
    exit 1
  fi
  npm ci
  npm run build
else
  echo "[1/5] 跳过构建（SKIP_BUILD=1），直接使用现有 dist/"
fi

echo "[2/5] 准备打包文件（package.json, package-lock.json, dist）"
rm -f "${DIST_ARCHIVE_NAME}" || true
rm -rf /tmp/deploy_temp || true
mkdir -p /tmp/deploy_temp

if [[ ! -d "dist" ]]; then
  echo "未找到 dist/，请先构建（或检查项目根目录是否正确）"
  exit 1
fi

if [[ ! -f "package.json" ]]; then
  echo "未找到 package.json，请确保在项目根目录执行"
  exit 1
fi

if [[ ! -f "package-lock.json" ]]; then
  echo "未找到 package-lock.json，请确保在项目根目录执行"
  exit 1
fi

# 复制文件到临时目录
cp package.json /tmp/deploy_temp/
cp package-lock.json /tmp/deploy_temp/
cp -r dist /tmp/deploy_temp/

echo "[3/5] 打包 -> ${DIST_ARCHIVE_NAME}"
# macOS 上 tar 可能会把 com.apple.* xattr（例如 provenance）打进包里，导致 Ubuntu 解压时提示：
# tar: Ignoring unknown extended header keyword 'LIBARCHIVE.xattr...'
# 这里通过环境变量与 exclude 规避这些元数据（不影响 dist 内容）。
COPYFILE_DISABLE=1 COPY_EXTENDED_ATTRIBUTES_DISABLE=1 tar \
  --exclude='.DS_Store' \
  --exclude='._*' \
  -czf "${DIST_ARCHIVE_NAME}" -C /tmp/deploy_temp .

# 清理临时目录
rm -rf /tmp/deploy_temp

echo "[4/5] 通过 scp 上传到 ${SERVER_USER}@${SERVER_HOST}:~/"
scp "${DIST_ARCHIVE_NAME}" "${SERVER_USER}@${SERVER_HOST}:~/"

echo "[5/5] 远端解压覆盖到部署目录: ${DEPLOY_TARGET_DIR}"
ssh "${SERVER_USER}@${SERVER_HOST}" "DEPLOY_TARGET_DIR='${DEPLOY_TARGET_DIR}' DIST_ARCHIVE_NAME='${DIST_ARCHIVE_NAME}' KEEP_ARCHIVE='${KEEP_ARCHIVE}' bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

target_dir="${DEPLOY_TARGET_DIR}"
archive_name="${DIST_ARCHIVE_NAME}"
src_path="${HOME}/${archive_name}"

pick_sudo() {
  if sudo -n true >/dev/null 2>&1; then
    echo "sudo -n"
    return 0
  fi
  echo ""
  return 0
}

SUDO="$(pick_sudo)"

echo "准备写入目录: ${target_dir}"
if mkdir -p "${target_dir}" 2>/dev/null && test -w "${target_dir}" 2>/dev/null; then
  :
elif [[ -n "${SUDO}" ]]; then
  ${SUDO} mkdir -p "${target_dir}"
else
  echo "没有权限写入: ${target_dir}（且 sudo -n 不可用）"
  echo "压缩包在: ${src_path}"
  exit 2
fi

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "${tmp_dir}" || true
}
trap cleanup EXIT

tar -xzf "${src_path}" -C "${tmp_dir}"

if command -v rsync >/dev/null 2>&1; then
  echo "使用 rsync 增量覆盖（不删除旧文件）"
  if test -w "${target_dir}" 2>/dev/null; then
    rsync -a "${tmp_dir}/" "${target_dir}/"
  else
    ${SUDO} rsync -a "${tmp_dir}/" "${target_dir}/"
  fi
else
  echo "未检测到 rsync，使用直接复制的方式覆盖（不删除旧文件）"
  if test -w "${target_dir}" 2>/dev/null; then
    cp -a "${tmp_dir}/." "${target_dir}/"
  else
    ${SUDO} cp -a "${tmp_dir}/." "${target_dir}/"
  fi
fi

# 更新 package.json，确保使用 CommonJS 模式
echo "更新 package.json 以使用 CommonJS 模式..."
package_json_path="${target_dir}/package.json"
if test -f "${package_json_path}"; then
  # 检查并更新 type 字段
  if grep -q '"type".*"module"' "${package_json_path}"; then
    echo "检测到 package.json 中的 type 为 module，正在更新为 commonjs..."
    # 创建临时文件
    temp_pkg=$(mktemp)
    sed 's/"type".*:.*"module"/"type": "commonjs"/g' "${package_json_path}" > "${temp_pkg}"
    
    # 替换原文件
    if test -w "${package_json_path}" 2>/dev/null; then
      mv "${temp_pkg}" "${package_json_path}"
    else
      ${SUDO} mv "${temp_pkg}" "${package_json_path}"
    fi
    echo "已更新 package.json，type 设置为 commonjs"
  else
    echo "package.json 的 type 字段已正确设置或不存在，跳过更新"
  fi
else
  echo "警告: 未找到 package.json 文件"
fi

# 安装依赖
echo "安装依赖..."
cd "${target_dir}"
if command -v npm >/dev/null 2>&1; then
  npm ci --production
else
  echo "警告: 服务器上未找到 npm，跳过依赖安装"
fi

if [[ "${KEEP_ARCHIVE}" != "1" ]]; then
  rm -f "${src_path}" || true
fi

echo "dist 发布完成：${target_dir}"
REMOTE_SCRIPT

if [[ "${KEEP_ARCHIVE}" != "1" ]]; then
  rm -f "${DIST_ARCHIVE_NAME}" || true
fi

echo "完成"

