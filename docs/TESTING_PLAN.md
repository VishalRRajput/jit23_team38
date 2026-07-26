# System Testing & Verification Plan

## Overview
This document specifies testing procedures to verify system functionality across hardware, backend API, real-time web sockets, geofencing logic, and frontend visualization.

---

## Test Suites & Procedures

### 1. Hardware Telemetry & REST API Test
- **Test Case**: ESP32 posts valid GPS payload to `POST /api/location`.
- **Expected Result**: Backend responds with `201 Created`, logs location record in MongoDB, calculates distance against geofence, and emits `location:update` over Socket.IO.

### 2. Geofence ENTRY / EXIT Triggering Test
- **Test Case**: Send coordinate point outside office radius $\rightarrow$ send coordinate point inside office radius.
- **Expected Result**:
  - `ENTRY` log created in `GeofenceLog`.
  - Today's `Attendance` record updated with `checkInTime`.
  - Live notification toast generated on admin dashboard.

### 3. Dual-Mode WiFi BSSID Indoor Fallback Test
- **Test Case**: Post payload with degraded GPS (Lat 0, Lng 0) but containing scanned WiFi BSSID matching registered office router (`AA:BB:CC:DD:EE:01`).
- **Expected Result**: System validates presence as `Inside Office` using `WIFI_BSSID` verification method.

### 4. Push Button Emergency SOS Alert Test
- **Test Case**: ESP32 sends payload with `sosAlert: true`.
- **Expected Result**: Real-time 🚨 SOS alert notification emitted to dashboard with exact coordinates.

### 5. Desktop Simulator Execution
Run command:
```bash
cd backend
npm run simulate-esp32
```
Verify live employee markers moving on the React Leaflet map dashboard in real time!
