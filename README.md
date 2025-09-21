# 💵 Point of Sales System - Invoice Module

A lightweight, modern Point of Sales invoice module for the web. It lets cashiers create invoices with smart product autocomplete, browse published invoices with pagination + lazy loading, and monitor revenue trends via an interactive time-series chart (pan/zoom + auto-scroll to newest period).

---

## 🚀 Demo
Check out the demo video: [Watch](https://drive.google.com/file/d/1zm7VyuBO4AMmLPMrT4ZQ6d-1X4_lAXmh/view?usp=sharing)

---

## ✨ Features
**Section 1 - Add invoice with autocomplete for product input**
- Mandatory invoice data are date, customer name, salesperson name, notes (optional), and multiple products sold.✅
- Autocomplete product suggestions as the user types. Each product suggestion should include product name, product picture, stock, and the price of the product (product data can be hard coded in JSON format)✅
- POST API called using fetch or axios to save the invoice to database✅
- Form cannot be submitted when at least one of the input boxes are empty ✅
- Show a warning message for invalid inputs (label or tooltip)✅
- Upon successful submission, proper notification pop-up should be shown✅

**Section 2 - Invoice card**
- An invoice card with pagination to show invoices that have been published✅
- The invoice cards should show summary of the invoice above such as customer name, salesperson name, total amount paid, and notes.✅
- The invoice data should be queried from backend using GET API using lazy loading method✅

**Section 3 - Time-series graph**
- Show a graph to project revenue from invoices for daily, weekly, and monthly✅
- It should enable user to pan and zoom to specific period✅
- Auto scroll when new data is pushed✅

---

## 📦 Tech Stack 
### Frontend
- React + Vite + TypeScript
- Redux Toolkit (RTK)
- Axios
- TailwindCSS + shadcn/ui
- react-hook-form + Zod
- Chart.js + chartjs-plugin-zoom

### Backend
- Node.js
- Prisma ORM
- MySQL

---

## 📂 Project Structure
```bash
pos-invoice/
├─ apps/
│  ├─ web/                        # Frontend (Vite + React + TS)
│  │  ├─ src/
│  │  │  ├─ api/axios.ts
│  │  │  ├─ components/
│  │  │  │  ├─ form/{InvoiceForm.tsx, ProductSearch.tsx}
│  │  │  │  └─ invoices/{InvoiceCard.tsx, InvoiceList.tsx}
│  │  │  ├─ components/charts/RevenueChart.tsx
│  │  │  ├─ features/
│  │  │  │  ├─ products/productSlice.ts       # autocomplete (local JSON)
│  │  │  │  ├─ invoices/invoiceSlice.ts       # GET/POST
│  │  │  │  └─ revenue/revenueSlice.ts        # GET /api/revenue
│  │  │  ├─ mock/products.ts                  # hard-coded product list
│  │  │  └─ store/{index.ts, hooks.ts}
│  │  └─ public/img/*                         # product images (optional)
│  └─ server/                     # Backend (Express + Prisma)
│     ├─ src/
│     │  ├─ index.ts                           # mount routes
│     │  ├─ lib/prisma.ts
│     │  └─ routes/
│     │     ├─ invoices.ts                     # POST & GET (cursor)
│     │     └─ revenue.ts                      # time-series API
│     └─ prisma/
│        ├─ schema.prisma
│        └─ seed.ts                            # seed Product ids 1..5
├─ package.json                                 # pnpm workspaces
└─ docker-compose.yml                           # docker
```

---

## 🚀 Getting Started
### Prerequisites
- **Node.js**: Version 18 or later.
- **npm**: Version 9 or later.
- **pnpm** (npm i -g pnpm)
- **MySQL** (local or via Docker)

### Clone the Repository
```bash
git clone https://github.com/racmathafidz/POS-Invoice.git
cd pos-invoice
```

### Start MySQL 🐳
```bash
docker compose up -d
# default user/pass: root/root, db: pos_invoice, host port: 3306
# if 3306 is busy, map to 3307 and update .env accordingly
```

### Backend env 🔐
Create `apps/server/.env` (if it doesn't exist yet):
```bash
DATABASE_URL="mysql://root:root@localhost:3306/pos_invoice"
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

### Frontend env 🔐
Create `apps/web/.env` (if it doesn't exist yet):
```bash
VITE_API_URL=http://localhost:4000
```

### Install deps 📥
From repo root:
```bash
pnpm install
```

### Prisma (generate / push / seed) 💾
From repo root:
```bash
pnpm --filter server exec prisma generate
pnpm --filter server run db:push
pnpm --filter server run db:seed
```
Seeder inserts Product rows with IDs 1..5 to match the frontend’s JSON suggestions.

### Run both apps in dev 🟢
From repo root:
```bash
pnpm dev
# FE: http://localhost:5173
# BE: http://localhost:4000
```

## Support
If you encounter any issues or have questions, feel free to create an issue on GitHub or reach out to the maintainer.



