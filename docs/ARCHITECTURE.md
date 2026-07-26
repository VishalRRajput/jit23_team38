# System Architecture & Technical Design

## Overview
The **WiFi and GPS Enabled Employee Tracking System** provides real-time location surveillance, hybrid indoor/outdoor geofence presence validation, automated attendance logging, AI movement intelligence, and executive reporting.

```
                   +-------------------------------------------------+
                   |           ESP32 HARDWARE TRACKER DEVICE         |
                   | - ESP32 Board (38-pin, CP2102)                  |
                   | - NEO-6M GPS (Latitude, Longitude, Speed)       |
                   | - Ambient WiFi Scanner (BSSID / RSSI)           |
                   | - 18650 Li-Ion + TP4056 + MT3608 Boost (5V)     |
                   | - Emergency Push Button & Status LED            |
                   +------------------------+------------------------+
                                            |
                                            | HTTP POST /api/location (WiFi/REST)
                                            v
                   +-------------------------------------------------+
                   |            EXPRESS.JS BACKEND SERVER            |
                   | - REST APIs (Auth, Employee, Location, Geofence)|
                   | - Dual-Mode Hybrid Geofence Engine (Haversine)  |
                   | - Automatic Attendance Generator                |
                   | - AI Movement & Anomaly Detection Service       |
                   +-------------------+-----------------------------+
                                       |
                   +-------------------+-----------------------------+
                   |                                                 |
                   v                                                 v
   +-------------------------------+               +-------------------------------+
   |      MONGODB DATABASE         |               |     REAL-TIME SOCKET.IO       |
   | - Admins & Roles              |               | - Live Location Broadcast     |
   | - Employees & Devices         |               | - Geofence Entry/Exit Stream  |
   | - Location Telemetry Logs     |               | - Push Button SOS Alert       |
   | - Geofences & WiFi BSSIDs     |               +---------------+---------------+
   | - Attendance & AI Insights    |                               |
   +-------------------------------+                               v
                                                   +-------------------------------+
                                                   |    REACT.JS DASHBOARD UI      |
                                                   | - Stat Cards & KPI Summaries  |
                                                   | - Leaflet Map + Dark Tiles    |
                                                   | - Recharts Presence Analytics |
                                                   | - AI Insights & Notifications |
                                                   +-------------------------------+
```

## Dual-Mode Geofencing Logic Flow
1. **GPS Coordinates Processing**: Calculate Haversine distance $d$ relative to geofence center $(\phi_c, \lambda_c)$ with radius $R$.
2. **Indoor WiFi Fallback**: If $d > R$ or GPS lock is void indoors ($<4$ satellites), scan ambient WiFi APs. If scanned MAC/BSSID matches any registered office router with RSSI $>-85\text{ dBm}$, presence is confirmed.
3. **Event Detection**:
   - `ENTRY`: State change to `Inside Office`. Creates `GeofenceLog`, auto-records today's `Attendance` checkInTime, emits `geofence:entry` socket event.
   - `EXIT`: State change to `Outside Geofence`. Calculates stay duration in minutes, updates today's `Attendance` checkOutTime & workingHours, emits `geofence:exit` socket event.
