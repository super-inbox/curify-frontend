# Curify Studio MVP

Curify Studio MVP is a project based on [Next.js](https://nextjs.org) that aims to provide video translation and management solutions. The project is built using modern frontend technologies, supporting multilingual translation and a user-friendly interface.

## Features

- **Video Translation**: Supports multilingual subtitle generation and translation.
- **Project Management**: Manages users' translation projects, including status tracking (processing, completed, etc.).
- **User Authentication**: Supports Google login and email login.
- **Credit System**: Displays users' free and paid credit balance.

## Tech Stack

- **Frontend Framework**: Next.js
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **API Calls**: Data interaction based on `fetch`
- **Multi-language Support**: `next-intl` for internationalization

## Quick Start

### Requirements

- Node.js version >= 16
- npm or yarn package manager

### Install Dependencies

```bash
npm install
# or use yarn
yarn install
```

### Start Development Server

Run the following command to start the local development server:

```bash
npm run dev
# or
yarn dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000) to view the project.

### Build for Production

Run the following command to build for production:

```bash
npm run build
# or
yarn build
```

After building, run the following command to start the production server:

```bash
npm start
# or
yarn start
```

### Environment Variables

Create a `.env.local` file in the project root directory and add the following environment variables:

```env
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## File Structure

```
curify_studio_mvp/
├── app/                              # Next.js application directory
│   ├── [locale]/                     # Dynamic routing, supports multi-language
│   │   ├── _components.tsx           # Common components
│   │   ├── _layout_components.tsx    # Layout-related components
│   │   ├── [pages]                   # Page folders
│   │   │   ├── page.tsx              # Page component
│   │   ├── layout.tsx                # Layout component
│   │   ├── page.tsx                  # Home page component
│   ├── api/                          # API routes
├── public/                           # Static assets
├── README.md                         # Project documentation
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