# SmartDose — Smart Medicine Reminder System (IoT Healthcare Web Application)

A production-quality, responsive web application for an IoT-based Smart Medicine Dispenser powered by an **ESP32 DevKit V1**, **DS3231 RTC module**, **four 74HC595 shift registers**, and a **28-LED array**.

---

## 1. Hardware Architecture & 28-LED Mapping

The dispenser provides a 7-day pillbox with 4 medication slots per day (**Morning, Noon, Evening, Night**). Each slot is illuminated by an individual red LED driven by four cascaded 8-bit shift registers (74HC595).

### 28-LED Assignment Table:
| Day of Week | Morning Slot | Noon Slot | Evening Slot | Night Slot | Shift Registers Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Monday** | **LED 1** (SR1-Bit0) | **LED 2** (SR1-Bit1) | **LED 3** (SR1-Bit2) | **LED 4** (SR1-Bit3) | 74HC595 Chip #1 |
| **Tuesday** | **LED 5** (SR1-Bit4) | **LED 6** (SR1-Bit5) | **LED 7** (SR1-Bit6) | **LED 8** (SR1-Bit7) | 74HC595 Chip #1 |
| **Wednesday** | **LED 9** (SR2-Bit0) | **LED 10** (SR2-Bit1) | **LED 11** (SR2-Bit2) | **LED 12** (SR2-Bit3) | 74HC595 Chip #2 |
| **Thursday** | **LED 13** (SR2-Bit4) | **LED 14** (SR2-Bit5) | **LED 15** (SR2-Bit6) | **LED 16** (SR2-Bit7) | 74HC595 Chip #2 |
| **Friday** | **LED 17** (SR3-Bit0) | **LED 18** (SR3-Bit1) | **LED 19** (SR3-Bit2) | **LED 20** (SR3-Bit3) | 74HC595 Chip #3 |
| **Saturday** | **LED 21** (SR3-Bit4) | **LED 22** (SR3-Bit5) | **LED 23** (SR3-Bit6) | **LED 24** (SR3-Bit7) | 74HC595 Chip #3 |
| **Sunday** | **LED 25** (SR4-Bit0) | **LED 26** (SR4-Bit1) | **LED 27** (SR4-Bit2) | **LED 28** (SR4-Bit3) | 74HC595 Chip #4 |

> Note: Bits 28 to 31 on 74HC595 Chip #4 are unused / grounded.

### Hardware Pinout:
- **ESP32 GPIO 23 (DATA / DS)** &rarr; Pin 14 of 74HC595 Chip #1
- **ESP32 GPIO 18 (CLOCK / SHCP)** &rarr; Pin 11 of all 4 chips (parallel bus)
- **ESP32 GPIO 5 (LATCH / STCP)** &rarr; Pin 12 of all 4 chips (parallel bus)
- **Cascade Pins**: Pin 9 ($Q_7'$) of Chip $N$ &rarr; Pin 14 (DS) of Chip $N+1$
- **DS3231 RTC**: I2C Bus on **GPIO 21 (SDA)** and **GPIO 22 (SCL)**
- **Tactile Ack Button**: **GPIO 4** (`INPUT_PULLUP`)
- **Piezo Buzzer**: **GPIO 2**

---

## 2. Medical Safety & Ingestion Verification Rule

> **CRITICAL MEDICAL DISCLAIMER:**  
> The web application and hardware dispenser **must never assume a medication was physically ingested** merely because a reminder alert was triggered, an LED was activated, or an acknowledgement button was clicked online.  
> Online acknowledgement indicates that the user or caregiver interacted with the system; physical adherence requires direct caregiver verification.

---

## 3. Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Components & Client Hooks)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom medical theme, glowing keyframes & dark mode
- **State & Storage**: Resilient Offline Local Storage + Firebase Realtime Database
- **Audio Synthesizer**: Native Web Audio API (works offline, zero external audio MP3 dependencies)
- **Analytics**: Recharts (7-Day Adherence Charts & Compliance Analytics)
- **Icons**: Lucide React

---

## 4. Getting Started Locally

### Prerequisites:
- Node.js 18+ or 20+
- npm 9+

### Installation:
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 5. Firebase Configuration (`.env.local`)

To connect to your live Firebase project, create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smartdose-health.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://smartdose-health-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=smartdose-health
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smartdose-health.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=102938475610
NEXT_PUBLIC_FIREBASE_APP_ID=1:102938475610:web:8a9b7c6d5e4f3a2b
```

> **Offline Resilience:** If Firebase keys are not provided, SmartDose automatically runs in resilient offline mode with full state persistence in `localStorage`, pre-seeded with clinical demo medications and schedule data.

---

## 6. Firebase Realtime Database Rules

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "devices": {
      "$deviceId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "weeklySchedule": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

---

## 7. ESP32 Synchronization JSON Contract

When the ESP32 queries the cloud or REST endpoint `/api/esp32/schedule`, it receives this compact JSON payload:

```json
{
  "protocolVersion": "1.2.0",
  "scheduleVersion": 3,
  "timezone": "Asia/Kolkata",
  "tzOffsetMinutes": 330,
  "totalLeds": 28,
  "shiftRegistersCount": 4,
  "slotsCount": 28,
  "timestamp": "2026-11-14T08:00:00.000Z",
  "slots": [
    {
      "ledId": 1,
      "day": "Monday",
      "dayIndex": 0,
      "slot": "morning",
      "slotIndex": 0,
      "enabled": true,
      "time": "08:00",
      "hour": 8,
      "minute": 0,
      "shiftRegister": 1,
      "bitIndex": 0,
      "medicine": "Pantoprazole Sodium",
      "dosage": "40 mg",
      "instructions": "Take before breakfast with water."
    }
    // ... remaining 27 slots
  ]
}
```

---

## 8. Offline Operation & RTC Resilience

1. **Flash Caching**: When a new schedule version is retrieved, the ESP32 writes the JSON to non-volatile flash (SPIFFS/Preferences).
2. **Wi-Fi Outages**: If Wi-Fi disconnects, the ESP32 continues running its main loop. The battery-backed DS3231 RTC triggers the exact LEDs on the 74HC595 shift registers.
3. **Re-connection**: When Wi-Fi restores, the ESP32 transmits its button acknowledgement timestamps back to the server.

---

## 9. Firmware

A full Arduino C++ sketch is included at [`firmware/SmartDose_ESP32.ino`](./firmware/SmartDose_ESP32.ino). It can be directly compiled in the Arduino IDE or PlatformIO for the ESP32 DevKit V1 board.

