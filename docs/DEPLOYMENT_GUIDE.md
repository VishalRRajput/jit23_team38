# Production Deployment Guide

This guide outlines deployment of the system across **Vercel** (Frontend), **Render** (Backend API & Socket.IO server), and **MongoDB Atlas** (Database).

---

## 1. Database Deployment (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with Read/Write credentials.
3. Under **Network Access**, add `0.0.0.0/0` to allow connection from Render backend.
4. Copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/employee_tracking?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render.com)
1. Push project repository to GitHub.
2. Log into [Render](https://render.com) and click **New + Web Service**.
3. Connect your repository and configure:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random String>`
   - `NODE_ENV`: `production`
5. Click **Create Web Service**. Note your backend production URL (e.g. `https://employee-tracking-backend.onrender.com`).

---

## 3. ESP32 Firmware Update for Cloud Backend
In `firmware/ESP32_Dual_Tracker.ino`:
```cpp
const char* SERVER_URL = "https://employee-tracking-backend.onrender.com/api/location";
```
Re-flash firmware to ESP32 board via Arduino IDE.

---

## 4. Frontend Deployment (Vercel)
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository and set:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**. Your enterprise web app will be live instantly!
