# Curify Frontend

Curify Studio's frontend is a modern, scalable Next.js 13+ application designed for AI-powered video translation, dubbing, subtitle editing, and project management.

---

## 🚀 Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js + Google OAuth
- **State**: Jotai atoms
- **i18n**: `next-intl` + JSON messages (EN/ZH)
- **API Services**: Modular REST clients with error handling
- **Types**: TypeScript-first design

---

## 📁 File Structure Overview

```
CURIFY-FRONTEND/
├── app/                     # Next.js App Router & pages
│   ├── [locale]/            # Localized routes
│   │   ├── _componentForPage/
│   │   ├── _components/
│   │   ├── _layout_components/
│   │   ├── about/
│   │   ├── auth/
│   │   ├── charge/
│   │   ├── contact/
│   │   ├── magic/
│   │   ├── pricing/
│   │   ├── project/
│   │   ├── subscription/
│   │   ├── workspace/
│   │   ├── authProvider.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   ├── globals.css
│   └── favicon.ico
│
├── atoms/                  # Jotai atoms (auth, UI, project)
├── components/             # UI components by domain (auth, ui, layout, etc.)
├── hooks/                  # Custom React hooks (useAuth, useUpload, etc.)
├── services/               # API interaction layer (auth, projects, etc.)
├── lib/                    # Utility functions & constants
├── types/                  # TypeScript type definitions
├── http/                   # HTTP wrapper (request.ts)
├── i18n/                   # Locale config and routing
├── messages/               # EN/ZH translation messages
├── public/                 # Static assets (images, videos)
├── styles/                 # Extra CSS files
├── __tests__/              # Test files
│
├── .env.local              # Runtime environment variables
├── .env.example            # Sample env config
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── package.json
├── types.d.ts              # Global TS declarations
└── README.md
```

---

## 🔍 Directory Highlights

### `app/` — Pages & Layout
- Fully localized routes (`[locale]/`)
- Includes pages for auth, project editor, subscription checkout, workspace, etc.

### `components/` — Reusable UI
- Split into: `auth/`, `ui/`, `layout/`, `project/`, and `subscription/`
- Atomic design principles (forms, buttons, modals, etc.)

### `hooks/` — Custom Hooks
- Abstracted business logic (e.g. `useCredits`, `useAuth`)
- Paired with atoms and service APIs

### `services/` — API Wrappers
- Organized by domain (auth, upload, analytics)
- Typed responses, central error handling

### `lib/` — Utility Logic
- Stateless functions: formatters, validators, error handlers

### `types/` — TypeScript Interfaces
- Auth, project, subscription, UI, and global API response types

### `atoms/` — Jotai State
- App-wide state (login, modals, credit balance)

### `i18n/` — Internationalization
- Routing + middleware
- EN/CH translations in `messages/`

---

## 🧪 Development & Testing

### Dev Setup

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Env Variables

```bash
cp .env.example .env.local
```
Then edit:
```env
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
```

### Testing Notes

- Sample videos in `/public/videos`
- Stripe sandbox for credit flow testing
- CORS handled via backend proxy/API gateway

---

## ✅ Benefits

- ✅ **Scalable** module structure
- ✅ **Fully typed** with TypeScript
- ✅ **i18n-ready** for global deployment
- ✅ **Production-grade** API/services separation
- ✅ **Modern UX** with Tailwind, blur/glass UI, and animation support

---

Curify Studio © 2025
