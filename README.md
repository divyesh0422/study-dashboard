# 📚 Student Study Management Dashboard

Production SaaS — Next.js 14 · TypeScript · Prisma · PostgreSQL · Shadcn UI

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file in project root
```bash
# ⚠️ Must be .env — NOT .env.local (Prisma won't read .env.local)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Setup database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start dev server
```bash
npm run dev
```

Open → **http://localhost:3000**

---

## 🛠️ All Commands

| Command | Action |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint check |
| `npx prisma studio` | Visual DB browser |
| `npx prisma db push` | Sync DB schema |
| `npx prisma generate` | Regenerate client |

---

## 🗂️ Features
- 🔐 Auth (Email/Password + Google OAuth)
- 📊 Dashboard with live stats & charts
- 📚 Subjects manager
- ✅ Task manager with filters & priorities
- 📝 Notes with tags & subject linking
- ⏱️ Pomodoro timer with session tracking
- 📈 Analytics (study hours, subject breakdown, streaks)

---

## 🧱 Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| UI | Shadcn UI + TailwindCSS |
| State | React Query + Zustand |
| Charts | Recharts |
| Animation | Framer Motion |
