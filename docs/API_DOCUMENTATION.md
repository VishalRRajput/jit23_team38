# REST API Documentation & Integration Specification

## Base URL
`http://localhost:5000/api`

---

## 1. ESP32 Location Telemetry API (Hardware Endpoint)

### POST `/api/location`
Receives location telemetry, battery health, scanned ambient WiFi BSSIDs, and SOS status from ESP32 microcontrollers.

#### Request Headers
`Content-Type: application/json`

#### Request Body Example
```json
{
  "deviceId": "ESP32_EMP_1001",
  "latitude": 37.774929,
  "longitude": -122.419416,
  "speed": 1.4,
  "satellites": 8,
  "battery": 95,
  "batteryVoltage": 4.1,
  "sosAlert": false,
  "scannedWifi": [
    {
      "ssid": "Office_WiFi_Network",
      "bssid": "AA:BB:CC:DD:EE:01",
      "rssi": -62
    }
  ]
}
```

#### Response Example (`201 Created`)
```json
{
  "success": true,
  "message": "Location data received and processed",
  "isInsideGeofence": true,
  "verificationMethod": "GPS",
  "eventTriggered": "ENTRY"
}
```

---

## 2. Authentication APIs

### POST `/api/auth/login`
Admin account login. Returns JWT bearer token.

#### Request Body
```json
{
  "email": "admin@company.com",
  "password": "adminpassword123"
}
```

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "660a1f...",
    "name": "Corporate Chief Admin",
    "email": "admin@company.com",
    "role": "superadmin"
  }
}
```

---

## 3. Employee Management APIs

### GET `/api/employees`
`Authorization: Bearer <token>`
Retrieves all registered employees. Supports `?search=` and `?department=` filters.

---

## 4. Geofence Management APIs

### GET `/api/geofences`
Returns list of active office geofence boundaries and registered WiFi BSSID signatures.

### POST `/api/geofences`
Create new geofence boundary with latitude, longitude, radius, and office WiFi MAC addresses.

---

## 5. Attendance & AI Analytics APIs

### GET `/api/attendance/daily?date=YYYY-MM-DD`
Retrieves daily attendance logs derived automatically from geofence movement logs.

### GET `/api/ai-analytics`
Retrieves movement pattern clustering, stay duration averages, late arrival anomalies, and high speed movement alerts.
