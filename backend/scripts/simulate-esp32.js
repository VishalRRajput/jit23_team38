const API_URL = process.env.API_URL || 'http://localhost:5000/api/location';

// Base coordinates: Corporate HQ (San Francisco)
const CENTER_LAT = 37.774929;
const CENTER_LNG = -122.419416;

const devices = [
  {
    deviceId: 'ESP32_EMP_1001',
    employeeId: 'EMP-1001',
    name: 'Alex Rivera',
    lat: CENTER_LAT,
    lng: CENTER_LNG,
    speed: 0.5,
    battery: 98,
    isInside: true
  },
  {
    deviceId: 'ESP32_EMP_1002',
    employeeId: 'EMP-1002',
    name: 'Sarah Chen',
    lat: CENTER_LAT + 0.005, // Starts Outside Geofence
    lng: CENTER_LNG + 0.005,
    speed: 15.2,
    battery: 84,
    isInside: false
  },
  {
    deviceId: 'ESP32_EMP_1003',
    employeeId: 'EMP-1003',
    name: 'Michael Vance',
    lat: CENTER_LAT - 0.0002,
    lng: CENTER_LNG + 0.0001,
    speed: 0.0,
    battery: 91,
    isInside: true
  }
];

let cycleCount = 0;

const sendTelemetry = (device) => {
  // Move coordinates slightly each cycle to simulate walking/driving
  if (device.isInside) {
    device.lat += (Math.random() - 0.5) * 0.0001;
    device.lng += (Math.random() - 0.5) * 0.0001;
  } else {
    // Move towards geofence slowly
    device.lat -= 0.0005;
    device.lng -= 0.0005;
    if (Math.abs(device.lat - CENTER_LAT) < 0.001) {
      device.isInside = true;
      console.log(`\n🚶 [SIMULATOR] Device ${device.deviceId} (${device.name}) MOVING INSIDE GEOFENCE!`);
    }
  }

  // Trigger occasional SOS alert on cycle 10
  const isSos = (cycleCount === 10 && device.deviceId === 'ESP32_EMP_1003');

  const payload = JSON.stringify({
    deviceId: device.deviceId,
    latitude: device.lat,
    longitude: device.lng,
    speed: device.speed,
    satellites: 8,
    battery: device.battery,
    batteryVoltage: 4.1,
    sosAlert: isSos,
    scannedWifi: [
      { ssid: 'Office_WiFi_Network', bssid: 'AA:BB:CC:DD:EE:01', rssi: device.isInside ? -55 : -92 },
      { ssid: 'Guest_WiFi_HQ', bssid: 'AA:BB:CC:DD:EE:02', rssi: device.isInside ? -62 : -95 }
    ]
  });

  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  })
  .then(async (res) => {
    try {
      const parsed = await res.json();
      console.log(`[ESP32 Simulator] Sent telemetry for ${device.deviceId} (${device.name}): Geofence=${parsed.isInsideGeofence}, Event=${parsed.eventTriggered || 'NONE'}`);
    } catch (e) {
      console.log(`[ESP32 Simulator] Posted payload for ${device.deviceId} (HTTP ${res.status})`);
    }
  })
  .catch((err) => {
    console.error(`[Simulator Error] Failed to post telemetry: ${err.message}`);
  });
};

console.log('================================================================');
console.log('  📡 ESP32 HARDWARE SIMULATOR ACTIVE');
console.log('  Pushing GPS & WiFi telemetry payloads every 4 seconds...');
console.log('================================================================\n');

setInterval(() => {
  cycleCount++;
  devices.forEach(device => sendTelemetry(device));
}, 4000);
