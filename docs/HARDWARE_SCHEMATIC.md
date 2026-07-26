# Hardware Circuit Schematic & Wiring Guide

## Hardware Component List
1. **ESP32 Development Board** (38-Pin CP2102 UART)
2. **NEO-6M GPS Module** (With ceramic antenna)
3. **18650 Li-Ion Battery** (3.7V 3000mAh)
4. **TP4056 Battery Charging Board** (Micro-USB 5V 1A with protection circuit)
5. **MT3608 Boost Converter** (Step-Up 3.7V $\rightarrow$ Regulated 5.0V output)
6. **Push Button** (SOS / Manual Trigger)
7. **LED & Resistor** (220$\Omega$ resistor for status indication)
8. **Jumper Wires & Breadboard / Plastic Enclosure**

---

## Complete Wiring Connection Table

| Component | Component Pin | ESP32 Pin / Destination | Purpose / Description |
|---|---|---|---|
| **NEO-6M GPS** | VCC | MT3608 OUT+ (5V) / ESP32 VIN | Power Supply for GPS |
| **NEO-6M GPS** | GND | Common GND | Power Ground |
| **NEO-6M GPS** | TX | GPIO 16 (RX2) | Hardware Serial RX |
| **NEO-6M GPS** | RX | GPIO 17 (TX2) | Hardware Serial TX |
| **Push Button** | Terminal 1 | GPIO 15 | Active LOW (Internal Pull-Up) |
| **Push Button** | Terminal 2 | Common GND | Ground |
| **Status LED** | Anode (+) | GPIO 4 | Network & GPS Status Indicator |
| **Status LED** | Cathode (-) | Common GND via 220$\Omega$ | Current Limiting Resistor |
| **TP4056** | B+ / B- | 18650 Battery (+) / (-) | Battery Charge Management |
| **TP4056** | OUT+ / OUT- | MT3608 IN+ / IN- | Raw Battery Output |
| **MT3608** | OUT+ / OUT- | ESP32 VIN / Common GND | Regulated 5.0V DC Rail |
| **Battery Divider**| Voltage Rail | GPIO 34 (ADC) | Battery Voltage Monitoring |

---

## Power Management Schematic
```
[18650 Cell 3.7V] ───> [TP4056 B+/B-] ───> [TP4056 OUT+/OUT-]
                                                    │
                                                    ▼
                                           [MT3608 IN+/IN-]
                                                    │ (Boost to 5.0V DC)
                                                    ▼
                             ┌──────────────────────┴──────────────────────┐
                             ▼                                             ▼
                      [ESP32 VIN (Pin 1)]                           [NEO-6M VCC]
                      [ESP32 GND (Pin 2)] ────────────────────────> [NEO-6M GND]
```

## Arduino IDE Flashing Instructions
1. Open `firmware/ESP32_Dual_Tracker.ino` in Arduino IDE or VS Code PlatformIO.
2. Select Board: **ESP32 Dev Module**.
3. Select Port: CP2102 Serial COM Port.
4. Set Baud Rate: `115200`.
5. Upload Firmware to ESP32 board.
