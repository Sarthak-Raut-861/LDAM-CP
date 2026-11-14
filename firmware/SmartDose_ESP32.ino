/*
 * SmartDose — ESP32 DevKit V1 Smart Medicine Dispenser Firmware
 * -------------------------------------------------------------
 * Hardware Topology:
 * - MCU: ESP32 DevKit V1
 * - RTC: DS3231 I2C Real-Time Clock (SDA = GPIO 21, SCL = GPIO 22)
 * - Shift Registers: 4x 74HC595 cascaded (32 output pins, 28 LEDs used)
 *   * DATA_PIN (DS / Pin 14)  = GPIO 23
 *   * CLOCK_PIN (SHCP / Pin 11)= GPIO 18
 *   * LATCH_PIN (STCP / Pin 12)= GPIO 5
 *   * Note: OE (Pin 13) -> GND, MR/SRCLR (Pin 10) -> 3.3V/5V
 * - Tactile Ack Button = GPIO 4 (INPUT_PULLUP)
 * - Piezo Buzzer       = GPIO 2
 *
 * 28-LED Mapping (7 Days x 4 Slots):
 * Monday:    LED 1 (Morning), LED 2 (Noon), LED 3 (Evening), LED 4 (Night)
 * Tuesday:   LED 5-8
 * Wednesday: LED 9-12
 * Thursday:  LED 13-16
 * Friday:    LED 17-20
 * Saturday:  LED 21-24
 * Sunday:    LED 25-28
 *
 * Web Live Demo:
 * When you press "Turn ON" / "LED ON" for LED #1 on the website (or any LED 1-28),
 * Firebase Realtime Database updates /deviceSyncStatus/activeLed.
 * This ESP32 polls Firebase every 1.5 seconds and lights up the exact LED!
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <RTClib.h>
#include <Preferences.h>

// Wi-Fi Credentials
const char* WIFI_SSID     = "Sarthak_Raut";
const char* WIFI_PASSWORD = "qwertyuiop";

// Firebase Realtime Database Host & Endpoints
const char* FIREBASE_HOST       = "ldam-cp-default-rtdb.firebaseio.com";
const char* SCHEDULE_ENDPOINT   = "https://ldam-cp-default-rtdb.firebaseio.com/weeklySchedule.json";
const char* ACTIVE_LED_ENDPOINT = "https://ldam-cp-default-rtdb.firebaseio.com/deviceSyncStatus/activeLed.json";
const char* TELEMETRY_ENDPOINT  = "https://ldam-cp-default-rtdb.firebaseio.com/deviceSyncStatus.json";

// Pin Definitions
#define PIN_74HC595_DATA   23
#define PIN_74HC595_CLOCK  18
#define PIN_74HC595_LATCH  5
#define PIN_ACK_BUTTON     4
#define PIN_BUZZER         2

RTC_DS3231 rtc;
Preferences preferences;
WiFiClientSecure secureClient;

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

// Shift 32 bits to 4x 74HC595 shift registers
void updateShiftRegisters(uint32_t bitmask) {
  digitalWrite(PIN_74HC595_LATCH, LOW);
  
  // Shift out 4 bytes (MSB first through all 4 cascaded chips: Register 4 down to Register 1)
  for (int b = 3; b >= 0; b--) {
    uint8_t byteVal = (bitmask >> (b * 8)) & 0xFF;
    shiftOut(PIN_74HC595_DATA, PIN_74HC595_CLOCK, MSBFIRST, byteVal);
  }
  
  digitalWrite(PIN_74HC595_LATCH, HIGH);
}

void turnOffAllLeds() {
  activeLedIndex = -1;
  updateShiftRegisters(0);
  digitalWrite(PIN_BUZZER, LOW);
}

void activateLed(uint8_t ledId) {
  if (ledId < 1 || ledId > 28) return;
  activeLedIndex = ledId;
  alarmStartTime = millis();
  
  // Bitmask: Bit (ledId - 1) is HIGH
  uint32_t mask = (1UL << (ledId - 1));
  updateShiftRegisters(mask);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n==============================================");
  Serial.println("  SmartDose IoT Dispenser — ESP32 Starting Up");
  Serial.println("==============================================");

  Wire.begin(21, 22); // I2C SDA=21, SCL=22

  pinMode(PIN_74HC595_DATA, OUTPUT);
  pinMode(PIN_74HC595_CLOCK, OUTPUT);
  pinMode(PIN_74HC595_LATCH, OUTPUT);
  pinMode(PIN_ACK_BUTTON, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);

  // Self-test: Flash LED #1 for 1 second on boot to verify shift registers
  Serial.println("[TEST] Hardware Self-Test: Turning ON LED #1 for 1s...");
  activateLed(1);
  delay(1000);
  turnOffAllLeds();
  Serial.println("[TEST] Self-Test complete. All LEDs OFF.");

  // Configure Secure Client (bypasses SSL cert chain validation for Firebase)
  secureClient.setInsecure();

  // Initialize DS3231 RTC
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
      Serial.println("  -> Solution: In Firebase Console -> Realtime Database -> Rules tab,");
      Serial.println("  -> change rules to { \".read\": true, \".write\": true } and click Publish.");
      http.end();
      return;
    }

    // Parse payload: can be raw number (e.g. "1"), "null", or JSON object
    if (payload == "null" || payload == "0" || payload == "") {
      if (activeLedIndex != -1) {
        Serial.println("[DEMO] Web command: Turn OFF all LEDs");
        turnOffAllLeds();
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
        // Direct string-to-int fallback
        targetLed = payload.toInt();
      }

      if (targetLed > 0 && targetLed <= 28) {
        if (activeLedIndex != targetLed) {
          Serial.printf("[DEMO SUCCESS] >>> Web command: Turn ON LED #%d <<<\n", targetLed);
          activateLed(targetLed);
        }
      } else if (targetLed == 0 && activeLedIndex != -1) {
        Serial.println("[DEMO] Web command: Turn OFF all LEDs");
        turnOffAllLeds();
      }
    }
  } else if (httpCode == 401 || httpCode == 403) {
    Serial.printf("[FIREBASE RULES] HTTP %d Permission Denied. Firebase RTDB rules must be set to read: true, write: true.\n", httpCode);
  } else if (httpCode < 0) {
    Serial.printf("[HTTP ERROR] Connect failed (%s)\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

void loop() {
  // Check tactile button for acknowledgement
  if (digitalRead(PIN_ACK_BUTTON) == LOW) {
    delay(50); // Debounce
    if (digitalRead(PIN_ACK_BUTTON) == LOW && activeLedIndex != -1) {
      Serial.printf("[BUTTON] Acknowledged active LED #%d\n", activeLedIndex);
      turnOffAllLeds();
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
      turnOffAllLeds();
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
          activateLed(scheduleTable[i].ledId);
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
