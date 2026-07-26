# Database Schema & Entity Relationship Diagram (ERD)

## Collections Overview

```
                      +-------------------+
                      |      ADMINS       |
                      +-------------------+
                      | _id (PK)          |
                      | name              |
                      | email (Unique)    |
                      | password (Hash)   |
                      | role              |
                      +-------------------+

                               │
                               │ Manages
                               ▼

                      +-------------------+
                      |     EMPLOYEES     |
                      +-------------------+
                      | _id (PK)          |
                      | employeeId (UQ)   |<-------------------+
                      | deviceId (UQ)     |<------------+      |
                      | name, department  |             |      |
                      | status            |             |      |
                      +-------------------+             |      |
                                                        |      |
                                                        |      |
                               │ Has Many               |      |
                               ▼                        |      |
                                                        |      |
                      +-------------------+             |      |
                      |     LOCATIONS     |             |      |
                      +-------------------+             |      |
                      | _id (PK)          |             |      |
                      | employeeId (FK)   |─────────────┼──────┘
                      | deviceId          |─────────────┘
                      | latitude, longitude|
                      | speed, battery    |
                      | isInsideGeofence  |
                      | scannedWifi []    |
                      +-------------------+

                               │
                               │ Triggers Events
                               ▼

  +-------------------+               +-------------------+
  |   GEOFENCE LOGS   |               |    ATTENDANCE     |
  +-------------------+               +-------------------+
  | _id (PK)          |               | _id (PK)          |
  | employeeId (FK)   |               | employeeId (FK)   |
  | eventType (EN/EX) |               | date (YYYY-MM-DD) |
  | verificationMethod|               | checkInTime       |
  | durationMinutes   |               | checkOutTime      |
  | timestamp         |               | workingHours      |
  +-------------------+               | status            |
                                      +-------------------+
```
