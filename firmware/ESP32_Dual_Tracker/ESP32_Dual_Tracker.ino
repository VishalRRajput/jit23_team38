/*
 * =================================================================================
 * Project: WiFi and GPS Enabled Employee Tracking System
 * Device Firmware: ESP32 Dual-Verification Location Tracker
 * Hardware Components:
 *   - ESP32 Development Board (38-pin, CP2102)
 *   - NEO-6M GPS Module (UART Serial2: RX=16, TX=17)
 *   - Status LED (GPIO 4) & System LED (GPIO 2)
 * =================================================================================
 */

#include "soc/rtc_cntl_reg.h"
#include "soc/soc.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

// HTTP/HTTPS Network Clients
WiFiClient plainClient;
WiFiClientSecure secureClient;

// --- HARDWARE PIN DEFINITIONS ---
#define GPS_RX_PIN 16    // ESP32 RX2 connected to NEO-6M TX
#define GPS_TX_PIN 17    // ESP32 TX2 connected to NEO-6M RX
#define STATUS_LED_PIN 4 // Network & GPS Status LED
#define SYSTEM_LED_PIN 2 // Onboard Activity LED

// --- CONFIGURATION PARAMETERS ---
const char *WIFI_SSID = "Vishal";         // Target WiFi SSID
const char *WIFI_PASSWORD = "vishu1211";  // Target WiFi Password
const char *DEVICE_ID = "ESP32_EMP_1001"; // Unique hardware identifier
const char *SERVER_URL =
    "http://7f68bf5894f029.lhr.life/api/location"; // Backend REST Endpoint

const unsigned long POST_INTERVAL_MS = 5000; // Send location every 5 seconds
unsigned long lastPostTime = 0;

// Hardware Serial Instance for GPS
HardwareSerial gpsSerial(2);

// --- NMEA GPS PARSER STRUCTURE ---
struct GPSData {
  double latitude = 0.0;
  double longitude = 0.0;
  float speedKmh = 0.0;
  float altitudeMeters = 0.0;
  int satellites = 0;
  bool validLock = false;
};

GPSData currentGps;

// --- FUNCTION PROTOTYPES ---
void setupHardware();
void connectWiFi();
void readGPS();
void parseNMEALine(String line);
void sendLocationPayload();
String scanAmbientWiFiBSSIDs();

void setup() {
  WRITE_PERI_REG(
      RTC_CNTL_BROWN_OUT_REG,
      0); // Disable brownout detector to prevent crash on WiFi startup
  Serial.begin(115200);
  secureClient.setInsecure(); // Allow connections to cloud HTTPS services (e.g. Render)
  setupHardware();
  connectWiFi();
  Serial.println(
      "[ESP32 Tracker] Initialized successfully. Starting main loop...");
}

void loop() {
  // Read incoming GPS data continuously from NEO-6M UART
  readGPS();

  // Periodic location upload
  if (millis() - lastPostTime >= POST_INTERVAL_MS) {
    lastPostTime = millis();
    digitalWrite(SYSTEM_LED_PIN, HIGH);
    sendLocationPayload();
    digitalWrite(SYSTEM_LED_PIN, LOW);
  }
}

void setupHardware() {
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(SYSTEM_LED_PIN, OUTPUT);

  digitalWrite(STATUS_LED_PIN, LOW);
  digitalWrite(SYSTEM_LED_PIN, LOW);

  // Initialize Serial2 for NEO-6M GPS (9600 baud rate)
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("[Hardware] NEO-6M GPS Serial initialized on RX:16 TX:17");
}

void connectWiFi() {
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  // CRITICAL FIX: Lower the WiFi transmit power to stop the massive current
  // spike causing the Brownout! Default is WIFI_POWER_19_5dBm. We lower it
  // to 8.5dBm.
  WiFi.setTxPower(WIFI_POWER_8_5dBm);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    digitalWrite(STATUS_LED_PIN,
                 !digitalRead(STATUS_LED_PIN)); // Blink while connecting
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(STATUS_LED_PIN, HIGH); // Solid ON when connected
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    digitalWrite(STATUS_LED_PIN, LOW);
    Serial.println(
        "\n[WiFi] Connection timed out. Will operate in scan-only mode.");
  }
}

void readGPS() {
  while (gpsSerial.available() > 0) {
    String nmeaLine = gpsSerial.readStringUntil('\n');
    parseNMEALine(nmeaLine);
  }
}

// Lightweight NMEA GPRMC sentence parser for Lat/Lng/Speed
void parseNMEALine(String line) {
  line.trim();
  if (line.startsWith("$GPRMC") || line.startsWith("$GNRMC")) {
    int commaIndex = 0;
    String tokens[13];
    int tokenCount = 0;

    for (int i = 0; i < line.length() && tokenCount < 13; i++) {
      if (line.charAt(i) == ',' || i == line.length() - 1) {
        tokens[tokenCount++] = line.substring(commaIndex, i);
        commaIndex = i + 1;
      }
    }

    // Check status field ('A' = Active/Valid, 'V' = Void)
    if (tokenCount > 2 && tokens[2] == "A") {
      currentGps.validLock = true;

      // Parse Latitude (DDMM.MMMM format)
      double rawLat = tokens[3].toDouble();
      double latDeg = (int)(rawLat / 100);
      double latMin = rawLat - (latDeg * 100);
      currentGps.latitude = latDeg + (latMin / 60.0);
      if (tokens[4] == "S")
        currentGps.latitude = -currentGps.latitude;

      // Parse Longitude (DDDMM.MMMM format)
      double rawLng = tokens[5].toDouble();
      double lngDeg = (int)(rawLng / 100);
      double lngMin = rawLng - (lngDeg * 100);
      currentGps.longitude = lngDeg + (lngMin / 60.0);
      if (tokens[6] == "W")
        currentGps.longitude = -currentGps.longitude;

      // Parse Speed in Knots -> Convert to km/h
      currentGps.speedKmh = tokens[7].toFloat() * 1.852;
      currentGps.satellites = 8; // Default active fix count
    } else {
      currentGps.validLock = false;
    }
  }
}

// Scan ambient WiFi networks to gather BSSIDs (MAC addresses) for indoor
// presence verification
String scanAmbientWiFiBSSIDs() {
  int numNetworks = WiFi.scanNetworks();
  StaticJsonDocument<512> doc;
  JsonArray array = doc.to<JsonArray>();

  for (int i = 0; i < min(numNetworks, 5); ++i) {
    JsonObject ap = array.createNestedObject();
    ap["ssid"] = WiFi.SSID(i);
    ap["bssid"] = WiFi.BSSIDstr(i);
    ap["rssi"] = WiFi.RSSI(i);
  }

  String output;
  serializeJson(doc, output);
  WiFi.scanDelete(); // Free memory
  return output;
}

void sendLocationPayload() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED)
      return;
  }

  HTTPClient http;
  if (strncmp(SERVER_URL, "https://", 8) == 0) {
    http.begin(secureClient, SERVER_URL);
  } else {
    http.begin(plainClient, SERVER_URL);
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Bypass-Tunnel-Reminder",
                 "true"); // Prevent localtunnel block page

  StaticJsonDocument<2048> payloadDoc;
  payloadDoc["deviceId"] = DEVICE_ID;
  payloadDoc["latitude"] = currentGps.latitude;
  payloadDoc["longitude"] = currentGps.longitude;
  payloadDoc["speed"] = currentGps.speedKmh;
  payloadDoc["gpsValid"] = currentGps.validLock;
  payloadDoc["satellites"] = currentGps.satellites;

  // Scan ambient WiFi BSSIDs for indoor presence double-verification
  int n = WiFi.scanNetworks();
  JsonArray wifiArray = payloadDoc.createNestedArray("scannedWifi");
  // Send up to 12 networks instead of just 4 to guarantee the Home WiFi is
  // caught!
  for (int i = 0; i < min(n, 12); ++i) {
    JsonObject ap = wifiArray.createNestedObject();
    ap["ssid"] = WiFi.SSID(i);
    ap["bssid"] = WiFi.BSSIDstr(i);
    ap["rssi"] = WiFi.RSSI(i);
  }
  WiFi.scanDelete();

  String requestBody;
  serializeJson(payloadDoc, requestBody);

  Serial.println("\n[POST /api/location] Sending Payload:");
  Serial.println(requestBody);

  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP] Status Code: %d, Response: %s\n", httpResponseCode,
                  response.c_str());
  } else {
    Serial.printf("[HTTP] Error Code: %s\n",
                  http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}
