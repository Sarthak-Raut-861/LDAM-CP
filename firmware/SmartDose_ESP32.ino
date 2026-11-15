/*
 * SmartDose — ESP32 DevKit V1 Smart Medicine Dispenser Firmware
 * -------------------------------------------------------------
 * Hardware Topology (Exact Pins From Your Working Setup):
 * - Shift Registers (4x 74HC595 cascaded):
 *   * DATA_PIN  = GPIO 19
 *   * CLOCK_PIN = GPIO 18
 *   * LATCH_PIN = GPIO 23
 * - I2C DS3231 RTC:
 *   * SDA = GPIO 21
 *   * SCL = GPIO 22
 * - Tactile Ack Button = GPIO 4 (INPUT_PULLUP)
 * - Buzzer / Blue Status LED = GPIO 2
 *
 * 28-LED Mapping (7 Days x 4 Slots across 4 ICs):
 * - IC 0 (Chip 1): Monday (LEDs 1-4, bits 0-3), Tuesday (LEDs 5-8, bits 4-7)
 * - IC 1 (Chip 2): Wednesday (LEDs 9-12, bits 0-3), Thursday (LEDs 13-16, bits 4-7)
 * - IC 2 (Chip 3): Friday (LEDs 17-20, bits 0-3), Saturday (LEDs 21-24, bits 4-7)
 * - IC 3 (Chip 4): Sunday (LEDs 25-28, bits 0-3)
 *
 * Startup Sequence:
 * On boot, ESP32 runs progressive 7-Day test: Monday -> Tuesday -> ... -> Sunday!
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <RTClib.h>
#include <Preferences.h>

// Shift Register Pins (Exact mapping from your working manual test)
#define DATA_PIN   19
#define CLOCK_PIN  18
#define LATCH_PIN  23

#define NUM_IC     4
#define NUM_LEDS   28

#define PIN_ACK_BUTTON 4
#define PIN_BUZZER     2 // Also onboard blue LED for visual alert feedback

// Wi-Fi Credentials
const char* WIFI_SSID     = "Sarthak_Raut";
const char* WIFI_PASSWORD = "qwertyuiop";

// Firebase Realtime Database Host & Endpoints
const char* FIREBASE_HOST       = "ldam-cp-default-rtdb.firebaseio.com";
const char* SCHEDULE_ENDPOINT   = "https://ldam-cp-default-rtdb.firebaseio.com/weeklySchedule.json";
const char* ACTIVE_LED_ENDPOINT = "https://ldam-cp-default-rtdb.firebaseio.com/deviceSyncStatus/activeLed.json";

RTC_DS3231 rtc;
Preferences preferences;
WiFiClientSecure secureClient;

byte ledData[NUM_IC];

// Memory structure for 28 slots
struct SlotSchedule {
  uint8_t ledId;      // 1 to 28
  uint8_t dayIndex;   // 0 = Mon, 6 = Sun
  uint8_t slotIndex;  // 0 = Morn, 1 = Noon, 2 = Eve, 3 = Night
  bool enabled;
  uint8_t hour;
  uint8_t minute;
};

SlotSchedule scheduleTable[28];
uint32_t currentScheduleVersion = 0;
int activeLedIndex = -1; // -1 means all LEDs off
unsigned long alarmStartTime = 0;
const unsigned long ALARM_TIMEOUT_MS = 45 * 60 * 1000UL; // 45 minutes timeout

const char* DAY_NAMES[7] = {
  "Monday    (LEDs 1-4:  Morning, Noon, Evening, Night)",
  "Tuesday   (LEDs 5-8:  Morning, Noon, Evening, Night)",
  "Wednesday (LEDs 9-12: Morning, Noon, Evening, Night)",
  "Thursday  (LEDs 13-16: Morning, Noon, Evening, Night)",
  "Friday    (LEDs 17-20: Morning, Noon, Evening, Night)",
  "Saturday  (LEDs 21-24: Morning, Noon, Evening, Night)",
  "Sunday    (LEDs 25-28: Morning, Noon, Evening, Night)"
};

// Shift 4 bytes out to 74HC595 chips (MSB first through all cascaded chips)
void updateRegisters() {
  digitalWrite(LATCH_PIN, LOW);

  for (int i = NUM_IC - 1; i >= 0; i--) {
    shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, ledData[i]);
  }

  digitalWrite(LATCH_PIN, HIGH);
}

void allOff() {
  for (int i = 0; i < NUM_IC; i++) {
    ledData[i] = 0;
  }
  updateRegisters();
  digitalWrite(PIN_BUZZER, LOW);
  activeLedIndex = -1;
}

void turnOnLED(int ledNumber) {
  allOff();

  if (ledNumber < 1 || ledNumber > NUM_LEDS) return;

  int ic = (ledNumber - 1) / 8;
  int bitPosition = (ledNumber - 1) % 8;

  ledData[ic] = (1 << bitPosition);

  updateRegisters();
  activeLedIndex = ledNumber;
  alarmStartTime = millis();
}

// Turn on all 4 LEDs for a single day (0 = Mon, 1 = Tue ... 6 = Sun)
void turnOnDay(int dayIndex) {
  allOff();
  if (dayIndex < 0 || dayIndex > 6) return;

  int ic = dayIndex / 2;                  // 0 for Mon/Tue, 1 for Wed/Thu, 2 for Fri/Sat, 3 for Sun
  bool isUpperHalf = (dayIndex % 2 == 1); // false for Mon, Wed, Fri, Sun; true for Tue, Thu, Sat

  if (isUpperHalf) {
    ledData[ic] = 0xF0; // upper 4 bits
  } else {
    ledData[ic] = 0x0F; // lower 4 bits
  }

  updateRegisters();
  activeLedIndex = 30 + dayIndex;
  alarmStartTime = millis();
}

// Progressive 7-Day startup test sequence
void runDayByDayStartupTest() {
  Serial.println("\n==============================================================");
  Serial.println("  [STARTUP TEST] Progressive 7-Day LED Sequence Starting");
  Serial.println("  Monday -> Tuesday -> Wednesday -> Thursday -> Friday -> Sat -> Sun");
  Serial.println("==============================================================");

  for (int day = 0; day < 7; day++) {
    Serial.printf("[TEST DAY %d/7] Lighting %s\n", day + 1, DAY_NAMES[day]);
    turnOnDay(day);
    digitalWrite(PIN_BUZZER, HIGH);
    delay(800);
    digitalWrite(PIN_BUZZER, LOW);
  }

  allOff();
  Serial.println("==============================================================");
  Serial.println("  [STARTUP TEST] Complete! All LEDs turned OFF.");
  Serial.println("==============================================================\n");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n==============================================");
  Serial.println("  SmartDose IoT Dispenser — ESP32 Starting Up");
  Serial.println("==============================================");

  // Configure Shift Register Pins
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(PIN_ACK_BUTTON, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);

  digitalWrite(DATA_PIN, LOW);
  digitalWrite(CLOCK_PIN, LOW);
  digitalWrite(LATCH_PIN, LOW);

  allOff();

  // Run the progressive 7-Day startup test immediately on boot
  runDayByDayStartupTest();

  // Configure Secure Client (bypasses SSL cert chain validation for Firebase)
  secureClient.setInsecure();

  // Initialize DS3231 RTC
  Wire.begin(21, 22); // I2C SDA=21, SCL=22
  if (!rtc.begin()) {
    Serial.println("[WARN] DS3231 RTC not detected on I2C bus (check SDA=21, SCL=22).");
  } else {
    Serial.println("[OK] DS3231 RTC initialized successfully.");
  }

  // Load offline schedule from Preferences flash
  preferences.begin("smartdose", false);
  currentScheduleVersion = preferences.getUInt("version", 0);
  Serial.printf("[NVS] Loaded Schedule v%u from Flash\n", currentScheduleVersion);

  // Connect to Wi-Fi
  Serial.printf("[Wi-Fi] Connecting to '%s'...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[Wi-Fi] CONNECTED! IP: %s | RSSI: %d dBm\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
    fetchScheduleFromCloud();
  } else {
    Serial.println("\n[Wi-Fi] Could not connect. Operating autonomously via DS3231 RTC and Flash cache.");
  }
}

void fetchScheduleFromCloud() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(secureClient, SCHEDULE_ENDPOINT);
  http.setTimeout(4000);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      uint32_t cloudVer = doc["scheduleVersion"] | 0;
      if (cloudVer > currentScheduleVersion) {
        Serial.printf("[SYNC] New schedule detected (v%u -> v%u). Updating flash...\n", currentScheduleVersion, cloudVer);

        JsonArray slots = doc["slots"];
        int idx = 0;
        for (JsonObject slot : slots) {
          if (idx >= 28) break;
          scheduleTable[idx].ledId = slot["ledId"] | (idx + 1);
          scheduleTable[idx].dayIndex = slot["dayIndex"] | 0;
          scheduleTable[idx].slotIndex = slot["slotIndex"] | 0;
          scheduleTable[idx].enabled = slot["enabled"] | false;
          scheduleTable[idx].hour = slot["hour"] | 8;
          scheduleTable[idx].minute = slot["minute"] | 0;
          idx++;
        }

        currentScheduleVersion = cloudVer;
        preferences.putUInt("version", currentScheduleVersion);
        preferences.putString("raw_json", payload);
        Serial.println("[SYNC] Schedule saved to NVS successfully.");
      }
    }
  }
  http.end();
}

void pollLiveDemoLed() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(secureClient, ACTIVE_LED_ENDPOINT);
  http.setTimeout(3000);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    payload.trim();

    // Check for Permission Denied error from Firebase
    if (payload.indexOf("Permission denied") >= 0) {
      Serial.println("[FIREBASE BLOCKED] Firebase Realtime Database returned 'Permission denied'!");
      http.end();
      return;
    }

    // Parse payload: can be raw number (e.g. "1"), "null", or JSON object
    if (payload == "null" || payload == "0" || payload == "") {
      if (activeLedIndex != -1) {
        Serial.println("[DEMO] Web command: Turn OFF all LEDs");
        allOff();
      }
    } else {
      DynamicJsonDocument doc(256);
      DeserializationError err = deserializeJson(doc, payload);

      int targetLed = -1;
      if (!err) {
        if (doc.is<int>()) {
          targetLed = doc.as<int>();
        } else if (doc.containsKey("activeLed")) {
          if (doc["activeLed"].isNull()) {
            targetLed = 0;
          } else {
            targetLed = doc["activeLed"].as<int>();
          }
        }
      } else {
        targetLed = payload.toInt();
      }

      // 1 to 28: Turn on specific single slot LED
      if (targetLed >= 1 && targetLed <= 28) {
        if (activeLedIndex != targetLed) {
          Serial.printf("[DEMO SUCCESS] >>> Web command: Turn ON LED #%d <<<\n", targetLed);
          turnOnLED(targetLed);
        }
      }
      // 30 to 36: Turn on entire Day (30 = Mon, 31 = Tue ... 36 = Sun)
      else if (targetLed >= 30 && targetLed <= 36) {
        int d = targetLed - 30;
        if (activeLedIndex != targetLed) {
          Serial.printf("[DEMO SUCCESS] >>> Web command: Lighting entire %s <<<\n", DAY_NAMES[d]);
          turnOnDay(d);
        }
      }
      // 99: Run the full 7-day animation sequence
      else if (targetLed == 99) {
        Serial.println("[DEMO SUCCESS] >>> Web command: Running 7-day startup test sequence! <<<");
        runDayByDayStartupTest();
      }
      // 0: Turn off
      else if (targetLed == 0 && activeLedIndex != -1) {
        Serial.println("[DEMO] Web command: Turn OFF all LEDs");
        allOff();
      }
    }
  } else if (httpCode == 401 || httpCode == 403) {
    Serial.printf("[FIREBASE RULES] HTTP %d Permission Denied.\n", httpCode);
  }
  http.end();
}

void loop() {
  // Check tactile button for acknowledgement or manual 7-day test
  if (digitalRead(PIN_ACK_BUTTON) == LOW) {
    delay(50); // Debounce
    if (digitalRead(PIN_ACK_BUTTON) == LOW) {
      if (activeLedIndex != -1) {
        Serial.printf("[BUTTON] Acknowledged active LED #%d\n", activeLedIndex);
        allOff();
      } else {
        // When no LED is active, pressing the physical button triggers the 7-day sequence!
        Serial.println("[BUTTON] Manual Test Triggered! Running 7-day LED sequence...");
        runDayByDayStartupTest();
      }
      delay(300); // Debounce delay
    }
  }

  // Poll web demo active LED state every 1.5 seconds for snappy demo response
  static unsigned long lastDemoPoll = 0;
  if (millis() - lastDemoPoll > 1500) {
    lastDemoPoll = millis();
    pollLiveDemoLed();
  }

  // Handle active alarm buzzer pulse
  if (activeLedIndex != -1) {
    if ((millis() / 500) % 4 == 0) {
      digitalWrite(PIN_BUZZER, HIGH);
    } else {
      digitalWrite(PIN_BUZZER, LOW);
    }

    // Check timeout
    if (millis() - alarmStartTime > ALARM_TIMEOUT_MS) {
      Serial.printf("[TIMEOUT] Alarm for LED #%d timed out after 45m.\n", activeLedIndex);
      allOff();
    }
  }

  // Every 15 seconds, check DS3231 RTC against 28 slots
  static unsigned long lastRtcCheck = 0;
  if (millis() - lastRtcCheck > 15000) {
    lastRtcCheck = millis();
    if (rtc.begin()) {
      DateTime now = rtc.now();
      // DS3231: 0 = Sun, 1 = Mon ... Convert to Mon = 0 ... Sun = 6
      uint8_t todayDayIndex = (now.dayOfTheWeek() == 0) ? 6 : (now.dayOfTheWeek() - 1);

      for (int i = 0; i < 28; i++) {
        if (scheduleTable[i].enabled &&
            scheduleTable[i].dayIndex == todayDayIndex &&
            scheduleTable[i].hour == now.hour() &&
            scheduleTable[i].minute == now.minute() &&
            activeLedIndex != scheduleTable[i].ledId) {

          Serial.printf("[ALARM] Scheduled LED #%d triggered at %02d:%02d\n",
            scheduleTable[i].ledId, now.hour(), now.minute());
          turnOnLED(scheduleTable[i].ledId);
          break;
        }
      }
    }
  }

  // Cloud schedule sync check every 60 seconds
  static unsigned long lastCloudSync = 0;
  if (millis() - lastCloudSync > 60000) {
    lastCloudSync = millis();
    fetchScheduleFromCloud();
  }
}
