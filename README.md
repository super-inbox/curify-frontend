# Curify Studio MVP

Curify Studio MVP 是一个基于 [Next.js](https://nextjs.org) 的项目，旨在提供视频翻译和管理的解决方案。该项目使用现代前端技术构建，支持多语言翻译和用户友好的界面。

## 功能特性

- **视频翻译**：支持多语言字幕生成和翻译。
- **项目管理**：管理用户的翻译项目，包括状态跟踪（处理中、已完成等）。
- **用户认证**：支持 Google 登录和邮箱登录。
- **积分系统**：显示用户的免费和付费积分余额。

## 技术栈

- **前端框架**：Next.js
- **样式**：Tailwind CSS
- **认证**：NextAuth.js
- **API 调用**：基于 `fetch` 的数据交互
- **多语言支持**：`next-intl` 实现国际化

## 快速开始

### 环境要求

- Node.js 版本 >= 16
- npm 或 yarn 包管理工具

### 安装依赖

```bash
npm install
# 或者使用 yarn
yarn install
```

### 启动开发服务器

运行以下命令启动本地开发服务器：

```bash
npm run dev
# 或
yarn dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看项目。

### 构建生产环境

运行以下命令构建生产环境：

```bash
npm run build
# 或
yarn build
```

构建完成后，运行以下命令启动生产服务器：

```bash
npm start
# 或
yarn start
```

### 环境变量

在项目根目录下创建 `.env.local` 文件，并添加以下环境变量：

```env
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 文件结构

```
curify_studio_mvp/
├── app/                              # Next.js 应用目录
│   ├── [locale]/                     # 动态路由，支持多语言
│   │   ├── _components.tsx           # 通用组建
│   │   ├── _layout_components.tsx    # 布局相关组件
│   │   ├── [pages]                   # 各页面文件夹
│   │   │   ├── page.tsx              # 页面组件
│   │   ├── layout.tsx                # 布局组件
│   │   ├── page.tsx                  # 首页组件
│   ├── api/                          # API 路由
├── public/                           # 静态资源
├── README.md                         # 项目说明文件
```

## 📄 Pages
- **LandingPage**: Hero section with CTAs: "Book a demo", "Try it free", "Login".
- **LoginPage**: Gmail login with account info pulled from backend.
- **ContactPage**: User dashboard showing current balance, monthly free credits, and projects.
- **MainPage**: Upload videos, specify language, project name (optional), and view credit consumption.
- **MagicPage**: Preview original/translated videos, editable translation table with timestamps.
- **ChargePage**: Purchase credits (Stripe integration placeholder).

## 📦 Notes

- Login and payments require backend integration.
- Video preview and subtitle editing are mocked.
- You can add Firebase/GCP/AWS backend or Supabase for auth and DB.

## 🧪 Testing Tips

- Use sample `.mp4` files under 20MB for uploads.
- Mock stripe responses with test keys.
- Ensure CORS headers are set for cloud APIs.

---

Curify Studio © 2025