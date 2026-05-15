# KaryFix - Quick Start Commands

## 🚀 First Time Setup

```bash
# Clone & Install
git pull
cd server && npm install
cd ../client && npm install
```

## 💾 Database Setup

```bash
# Seed database with all 217 services + admin user
cd server
npm run seed:all
```

**Admin Login:** `admin@karyfix.com` / `admin123`

## ▶️ Start Development

```bash
# Terminal 1 - Backend (port 8000)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

## 🔄 Quick Commands Reference

| Task | Command |
|------|---------|
| Pull latest code | `git pull` |
| Install dependencies | `npm install` |
| Seed all data | `npm run seed:all` |
| Seed only services | `npm run seed:services` |
| Seed only admin | `npm run seed:admin` |
| Start backend | `npm run dev` (in server/) |
| Start frontend | `npm run dev` (in client/) |

## 📍 Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Admin Dashboard:** http://localhost:5173/admin/dashboard

---

**Note:** MongoDB must be running locally on port 27017
