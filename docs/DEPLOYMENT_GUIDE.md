# Full Cloud Production Deployment Guide (Render + Vercel + MongoDB Atlas)

This guide walks through deploying the **WiFi & GPS Employee Tracking System** entirely to the cloud for free:
- **Database**: MongoDB Atlas (Cloud Database)
- **Backend**: Render (Node.js API & Socket.IO real-time WebSocket server)
- **Frontend**: Vercel (React + Vite Dashboard with Leaflet & 3D Digital Twin)
- **Hardware**: ESP32 Firmware pointing to the Render HTTPS endpoint

Once deployed, the ESP32 can transmit data over **any Wi-Fi network or mobile hotspot**, and your dashboard can be opened securely from **any browser worldwide**.

---

## Architecture Overview

```
[ ESP32 Hardware Tracker ] (Any Wi-Fi / Hotspot)
           │
           │ HTTPS POST /api/location
           ▼
[ Render Web Service ] ──────▶ [ MongoDB Atlas ]
   (Node.js / Express)               (M0 Cloud DB)
           ▲
           │ WSS / Socket.IO & HTTPS REST
           ▼
[ Vercel Web App ] (React Vite SPA)
```

---

## Step 1: Database Setup (MongoDB Atlas - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in / register.
2. Click **Create Deployment** and select the **M0 Free** shared tier.
3. Under **Security Quickstart** (or **Database Access** in the left sidebar):
   - Create a database user with username (e.g. `trackerAdmin`) and a strong password. Save this password.
4. Under **Network Access** (in the left sidebar):
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. (This enables the Render cloud servers to connect).
5. In **Database Deployments**, click **Connect** -> **Drivers** (Node.js):
   - Copy your connection string:
     ```
     mongodb+srv://trackerAdmin:<password>@cluster0.xxxx.mongodb.net/employee_tracking?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password and ensure the database name `employee_tracking` is included before the `?`.

---

## Step 2: Push Code to GitHub

Ensure all your latest files are committed and pushed to your GitHub repository:
```powershell
git add .
git commit -m "Configure production cloud deployment for Render and Vercel"
git push origin main
```

---

## Step 3: Backend Deployment (Render.com)

1. Log into [Render](https://render.com) (sign up with GitHub).
2. Click **New +** at the top right and select **Web Service**.
3. Connect your GitHub repository (`Live_tracking` or your repo name).
4. Fill in the deployment settings:
   - **Name**: `employee-tracking-backend` (or custom name)
   - **Region**: Choose the region closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Expand **Advanced** -> **Environment Variables** and add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Render will bind its port automatically |
   | `MONGODB_URI` | `mongodb+srv://trackerAdmin:YourPassword@cluster0.xxx.mongodb.net/employee_tracking?retryWrites=true&w=majority` | Your Atlas string from Step 1 |
   | `JWT_SECRET` | `super_secret_jwt_key_employee_tracking_2026` | Any secret random string |
   | `JWT_EXPIRES_IN` | `7d` | Token expiration duration |

6. Click **Create Web Service**.
7. Render will build and deploy your service. Once deployment succeeds:
   - Your public backend URL will be displayed at the top, e.g.:
     `https://employee-tracking-backend.onrender.com`
   - Verify it in your browser: opening `https://employee-tracking-backend.onrender.com/` will return:
     `{"status":"ONLINE","system":"WiFi & GPS Employee Tracking System Backend API","version":"1.0.0","health":"/api/health"}`

*(Optional)* Run database seed on Render:
If you want to populate default admin accounts and initial test employees, click the **Shell** tab in your Render dashboard and run:
```bash
npm run seed
```

---

## Step 4: Frontend Deployment (Vercel)

1. Log into [Vercel](https://vercel.com) (sign up with GitHub).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend` (crucial!)
   - **Build and Output Settings**: Leave defaults (`npm run build` and `dist`)
5. Under **Environment Variables**, add:
   | Name | Value |
   | :--- | :--- |
   | `VITE_BACKEND_URL` | `https://employee-tracking-backend.onrender.com` |
   *(Use your exact Render backend URL from Step 3 without trailing slash)*

6. Click **Deploy**.
7. Vercel will build the frontend in ~45 seconds and give you a live production URL:
   `https://live-tracking-frontend.vercel.app`
8. Open the link! The dashboard will connect to your Render backend and Socket.IO real-time stream.

---

## Step 5: Update & Flash ESP32 Firmware

Now update your ESP32 Arduino code to send data directly to your Render backend:

1. Open `firmware/ESP32_Dual_Tracker/ESP32_Dual_Tracker.ino` in Arduino IDE.
2. Update the Wi-Fi credentials and `SERVER_URL`:
   ```cpp
   // --- CONFIGURATION PARAMETERS ---
   const char *WIFI_SSID = "Your_WiFi_Or_Hotspot_Name";
   const char *WIFI_PASSWORD = "Your_WiFi_Password";
   const char *DEVICE_ID = "ESP32_EMP_1001";
   const char *SERVER_URL = "https://employee-tracking-backend.onrender.com/api/location";
   ```
   > **Note on HTTPS**: The firmware already includes `WiFiClientSecure` with `secureClient.setInsecure()`, so it will securely transmit to Render's HTTPS URL without SSL certificate errors.

3. Select your ESP32 Board and COM Port, then click **Upload**.
4. Open the Arduino Serial Monitor (`115200 baud`).
   - You should see:
     ```
     [WiFi] Connected to Your_WiFi_Or_Hotspot_Name! IP: 192.168.x.x
     [ESP32 Tracker] Initialized successfully. Starting main loop...
     [POST /api/location] Sending Payload:
     [HTTP] Status Code: 200, Response: {"success":true,...}
     ```

---

## Step 6: Test Cloud Simulator (No hardware needed)

If you want to test the full cloud deployment right now without turning on the physical ESP32 board:

Run the telemetry simulator pointing to your Render backend:
```powershell
$env:API_URL="https://employee-tracking-backend.onrender.com/api/location"
node backend/scripts/simulate-esp32.js
```
Open your Vercel frontend in any browser or on your phone:
- Watch live employee movement on the Leaflet map and 3D Digital Twin!
- Watch geofence entry/exit events, attendance timestamps, and alerts update in real-time via Socket.IO.

---

## Important Notes & Troubleshooting

### Render Free Tier Inactivity (Spin-down)
- Render Free web services spin down after 15 minutes of inactivity.
- When an ESP32 ping or browser hit arrives after sleep, Render takes ~30–45 seconds to wake up (cold start).
- Once awake, everything runs smoothly in real time.
- **Tip**: You can use a free uptime monitor (like [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) to ping `https://your-backend.onrender.com/api/health` every 10 minutes to keep the backend warm 24/7.
