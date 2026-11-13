@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Wing Vue 应用启动脚本
REM 作者: AI Assistant
REM 创建时间: 2025-10-27
REM 版本: v1.0.0

echo.
echo 🚀 Wing Vue 应用启动脚本
echo ==================================
echo.

REM 显示项目信息
echo 📋 项目信息:
echo   名称: Wing Vue
echo   版本: 0.0.0
echo   框架: Vue 3 + Vite + Element Plus + Ant Design Vue
echo   特点: PC端优化 + 三文件分离 + 自动路由
echo.

REM 获取本地IP地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "LOCAL_IP=%%a"
    set "LOCAL_IP=!LOCAL_IP:~1!"
    goto :ip_found
)
:ip_found
if not defined LOCAL_IP set "LOCAL_IP=127.0.0.1"
echo 🌐 本地IP地址: %LOCAL_IP%
echo.

REM 检查依赖
:check_dependencies
if exist "node_modules\" (
    set "DEPS_STATUS=✅ 依赖已安装"
) else (
    set "DEPS_STATUS=❌ 依赖未安装"
    set "NEED_INSTALL=1"
)

REM 检查配置文件
if exist "vite.config.js" (
    set "ENV_STATUS=✅ Vite配置文件存在"
) else (
    set "ENV_STATUS=❌ Vite配置文件缺失"
)

REM 检查端口占用
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    set "PORT_STATUS=📡 端口 5173 已被占用"
) else (
    set "PORT_STATUS=📡 端口 5173 可用"
)

REM 显示项目状态
echo 📊 项目状态检查:
echo   %DEPS_STATUS%
echo   %ENV_STATUS%
echo   %PORT_STATUS%
echo.

REM 首次运行时安装依赖
if defined NEED_INSTALL (
    echo 📦 首次运行，正在安装依赖...
    call pnpm install
    if !errorlevel! neq 0 (
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo.
)

REM 显示菜单
:menu
cls
echo.
echo 🚀 Wing Vue 应用启动脚本
echo ==================================
echo.
echo 📋 项目信息:
echo   名称: Wing Vue
echo   版本: 0.0.0
echo   框架: Vue 3 + Vite + Element Plus + Ant Design Vue
echo.
echo 🌐 本地IP地址: %LOCAL_IP%
echo.
echo 📊 项目状态:
echo   %DEPS_STATUS%
echo   %ENV_STATUS%
echo   %PORT_STATUS%
echo.
echo ==========================================
echo 请选择要执行的操作：
echo ==========================================
echo.
echo   1. 启动开发服务器 (pnpm run dev) [推荐]
echo   2. 构建生产版本 (pnpm run build)
echo   3. 预览生产版本 (pnpm run preview)
echo   4. 安装/更新依赖 (pnpm install)
echo   5. 清理缓存和重置
echo   6. 退出
echo.
echo 💡 提示: 直接按 Enter 键使用默认选项 1
echo.

set /p "choice=请输入选项 (1-6) [默认: 1]: "
if not defined choice set "choice=1"

if "%choice%"=="1" goto :start_dev
if "%choice%"=="2" goto :build
if "%choice%"=="3" goto :preview
if "%choice%"=="4" goto :install
if "%choice%"=="5" goto :clean
if "%choice%"=="6" goto :exit
goto :invalid_choice

REM ========== 选项 1: 启动开发服务器 ==========
:start_dev
echo.
echo 🔧 启动开发服务器...
echo ==========================================
echo.

REM 强制关闭 5173 端口
echo 🔍 检查端口 5173 占用情况...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo ⚠️  端口 5173 被进程 %%a 占用，正在关闭...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo ✅ 端口 5173 已释放
    goto :port_freed_dev
)
echo ✅ 端口 5173 可用
:port_freed_dev
echo.

echo 📍 本地访问: http://localhost:5173/
echo 🌐 网络访问: http://api.example.invalid/
echo 🚪 监听地址: http://0.0.0.0:5173/
echo.
echo 💡 按 Ctrl+C 停止服务器
echo 💡 开发服务器运行在端口 5173 (0.0.0.0)
echo.
echo ==========================================
echo.
call pnpm run dev -- --host 0.0.0.0 --port 5173
goto :end

REM ========== 选项 2: 构建生产版本 ==========
:build
echo.
echo 🏗️  构建生产版本...
echo ==========================================
echo.
call pnpm run build
if !errorlevel! equ 0 (
    echo.
    echo ✅ 构建完成！构建文件位于 dist\ 目录
    echo.
    echo 📊 构建信息:
    if exist "dist\" (
        for /f "tokens=3" %%a in ('dir /s "dist" ^| findstr /C:"File(s)"') do echo   文件数量: %%a
        for /f "tokens=3" %%a in ('dir /s "dist" ^| findstr /C:"bytes"') do echo   总大小: %%a bytes
    )
    echo.
    echo 💡 提示: 可以选择选项 3 预览构建结果
) else (
    echo.
    echo ❌ 构建失败，请检查错误信息
)
echo.
pause
goto :menu

REM ========== 选项 3: 预览生产版本 ==========
:preview
if not exist "dist\" (
    echo.
    echo ❌ 未找到构建文件，请先运行构建命令 (选项 2)
    echo 💡 或直接运行: pnpm run build
    echo.
    pause
    goto :menu
)
echo.
echo 👀 预览生产版本...
echo ==========================================
echo.

REM 强制关闭 5173 端口
echo 🔍 检查端口 5173 占用情况...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo ⚠️  端口 5173 被进程 %%a 占用，正在关闭...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo ✅ 端口 5173 已释放
    goto :port_freed_preview
)
echo ✅ 端口 5173 可用
:port_freed_preview
echo.

echo 📍 本地访问: http://localhost:5173/
echo 🌐 网络访问: http://api.example.invalid/
echo 🚪 监听地址: http://0.0.0.0:5173/
echo.
echo 💡 按 Ctrl+C 停止预览服务器
echo.
echo ==========================================
echo.
call pnpm run preview -- --host 0.0.0.0 --port 5173
goto :end

REM ========== 选项 4: 安装/更新依赖 ==========
:install
echo.
echo 📦 安装/更新依赖...
echo ==========================================
echo.
call pnpm install
if !errorlevel! equ 0 (
    echo.
    echo ✅ 依赖安装/更新完成！
    set "DEPS_STATUS=✅ 依赖已安装"
) else (
    echo.
    echo ❌ 依赖安装失败，请检查网络连接
)
echo.
pause
goto :menu

REM ========== 选项 5: 清理缓存和重置 ==========
:clean
echo.
echo 🧹 清理缓存和重置...
echo ==========================================
echo.
echo 🗑️  清理 node_modules...
if exist "node_modules\" (
    rd /s /q "node_modules"
    echo   ✅ node_modules 已删除
) else (
    echo   ℹ️  node_modules 不存在
)
echo.
echo 🗑️  清理 pnpm-lock.yaml...
if exist "pnpm-lock.yaml" (
    del /f /q "pnpm-lock.yaml"
    echo   ✅ pnpm-lock.yaml 已删除
) else (
    echo   ℹ️  pnpm-lock.yaml 不存在
)
echo.
echo 🗑️  清理 dist 目录...
if exist "dist\" (
    rd /s /q "dist"
    echo   ✅ dist 目录已删除
) else (
    echo   ℹ️  dist 目录不存在
)
echo.
echo ✅ 清理完成！
echo 💡 现在可以重新运行脚本安装依赖
echo.
set "DEPS_STATUS=❌ 依赖未安装"
set "NEED_INSTALL=1"
pause
goto :menu

REM ========== 选项 6: 退出 ==========
:exit
cls
echo.
echo 👋 感谢使用 Wing Vue！
echo.
echo ==========================================
echo 📚 文档位置:
echo ==========================================
echo   - README.md: 项目说明
echo   - docs\: 完整文档
echo   - aries\: 深度文档
echo.
echo ==========================================
echo 🌐 项目地址:
echo ==========================================
echo   - GitHub: https://github.com/wing/wing-vue
echo   - 本地: http://localhost:5173/
echo.
echo ==========================================
echo 快捷命令:
echo ==========================================
echo   pnpm run dev      - 启动开发服务器
echo   pnpm run build    - 构建生产版本
echo   pnpm run preview  - 预览生产版本
echo   pnpm install      - 安装依赖
echo.
exit /b 0

REM ========== 无效选项 ==========
:invalid_choice
echo.
echo ❌ 无效选项 '%choice%'
echo 💡 有效选项: 1-6
echo.
pause
goto :menu

:end
echo.
echo ==========================================
echo 服务已停止
echo ==========================================
echo.
pause
