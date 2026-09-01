# Refer & Earn Platform 🚀 

A modern multi-tier referral and rewards web application built with **React**, **Node.js/Express**, **MongoDB**, and **Socket.io**.

----

## 🌟 Key Features

- **Public Landing Page (`/`)**: High-converting landing page explaining the 2-tier commission model, interactive animated network visualization, trust points, and multi-tier rewards breakdown.
- **Referrer Dashboard (`/dashboard`)**:
  - Live wallet balance counter & fast copyable referral link.
  - **Payment Wallet Setup**: Save payout accounts (Easypaisa, JazzCash, Bank Transfer) with masked account display and automatic prefilling for withdrawals.
  - **Lead Management**: Submit candidate leads and track progress across pipeline stages (*Submitted*, *In Review*, *Converted*, *Lost*).
  - **Withdrawal Requests**: Request instant payouts to saved or custom accounts.
- **Admin Dashboard (`/admin`)**:
  - Platform analytics (total referrals, conversion rate, total earnings, pending payouts).
  - Top referrers leaderboard.
  - Lead review & status management with automated commission credit warnings.
  - Withdrawal approvals and rejections with payment reference tracking.
- **Real-Time Messaging (`/messages`)**:
  - Live chat powered by Socket.io between Referrers and Admin Support.
  - Role-aware recipient selection ("+ New Message" modal and empty state prompts).
  - Optimistic sending, live connection indicators, and conversation bump sorting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS Design System (Sora & Inter typography, Emerald & Gold aesthetic)
- **Animations**: Framer Motion
- **Networking**: Axios & Socket.io Client

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB & Mongoose
- **Real-Time Engine**: Socket.io
- **Auth**: JWT & Bcrypt password hashing

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev # or npm start
```
*Make sure your `.env` is configured with `PORT`, `MONGO_URI`, and `JWT_SECRET`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📄 License
MIT License
