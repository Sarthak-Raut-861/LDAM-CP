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
 *   * OE (Pin 13) -> MUST CONNECT TO GND
 *   * MR/SRCLR (Pin 10) -> MUST CONNECT TO 3.3V or 5V
 * - Tactile Button = GPIO 4 (INPUT_PULLUP)
 * - Buzzer / Status LED = GPIO 2 (Also ESP32 onboard Blue LED)
 *
 * 28-LED Mapping (7 Days x 4 Slots):
 * - Monday:    LED 1 (Morning), LED 2 (Noon), LED 3 (Evening), LED 4 (Night)   [Bits 0-3]
 * - Tuesday:   LED 5-8                                                        [Bits 4-7]
 * - Wednesday: LED 9-12                                                       [Bits 8-11]
 * - Thursday:  LED 13-16                                                      [Bits 12-15]
 * - Friday:    LED 17-20                                                      [Bits 16-19]
 * - Saturday:  LED 21-24                                                      [Bits 20-23]
 * - Sunday:    LED 25-28                                                      [Bits 24-27]
 *
 * Startup Test Sequence:
 * At boot, the ESP32 performs a progressive 7-day startup test:
 * Monday (all 4) -> Tuesday (all 4) -> Wednesday (all 4) -> ... -> Sunday (all 4)!
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <RTClib.h>
#include <Preferences.h>

// Set to true only if your LEDs are wired Active-LOW (Anode to VCC, Cathode to 74HC595)
// Default is false: Active-HIGH (Cathode to GND, Anode to 74HC595)
const bool ACTIVE_LOW_LEDS = false;

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
#define PIN_BUZZER         2  // Note: GPIO 2 is also the ESP32 onboard blue LED!

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

// 7-Day Bitmask Definitions (4 slots each day)
const uint32_t DAY_MASKS[7] = {
  0x0000000F, // Monday:    Bits 0-3   (LEDs 1, 2, 3, 4)
  0x000000F0, // Tuesday:   Bits 4-7   (LEDs 5, 6, 7, 8)
  0x00000F00, // Wednesday: Bits 8-11  (LEDs 9, 10, 11, 12)
  0x0000F000, // Thursday:  Bits 12-15 (LEDs 13, 14, 15, 16)
  0x000F0000, // Friday:    Bits 16-19 (LEDs 17, 18, 19, 20)
  0x00F00000, // Saturday:  Bits 20-23 (LEDs 21, 22, 23, 24)
  0x0F000000  // Sunday:    Bits 24-27 (LEDs 25, 26, 27, 28)
};

const char* DAY_NAMES[7] = {
  "Monday    (LEDs 1-4:  Morning, Noon, Evening, Night)",
  "Tuesday   (LEDs 5-8:  Morning, Noon, Evening, Night)",
  "Wednesday (LEDs 9-12: Morning, Noon, Evening, Night)",
  "Thursday  (LEDs 13-16: Morning, Noon, Evening, Night)",
  "Friday    (LEDs 17-20: Morning, Noon, Evening, Night)",
  "Saturday  (LEDs 21-24: Morning, Noon, Evening, Night)",
  "Sunday    (LEDs 25-28: Morning, Noon, Evening, Night)"
};

// Shift 32 bits to 4x 74HC595 shift registers with clean microsecond clock pulses
void updateShiftRegisters(uint32_t bitmask) {
  if (ACTIVE_LOW_LEDS) {
    bitmask = ~bitmask;
  }

  digitalWrite(PIN_74HC595_LATCH, LOW);
  delayMicroseconds(5);

  // Shift out 4 bytes (MSB first through all 4 cascaded chips: Register 4 down to Register 1)
  for (int b = 3; b >= 0; b--) {
    uint8_t byteVal = (bitmask >> (b * 8)) & 0xFF;
    for (int i = 7; i >= 0; i--) {
      digitalWrite(PIN_74HC595_CLOCK, LOW);
      digitalWrite(PIN_74HC595_DATA, (byteVal & (1 << i)) ? HIGH : LOW);
      delayMicroseconds(3);
      digitalWrite(PIN_74HC595_CLOCK, HIGH);
      delayMicroseconds(3);
    }
  }

  digitalWrite(PIN_74HC595_CLOCK, LOW);
  delayMicroseconds(5);
  digitalWrite(PIN_74HC595_LATCH, HIGH);
  delayMicroseconds(5);
  digitalWrite(PIN_74HC595_LATCH, LOW);
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

// Progressive Day-by-Day test sequence: Monday -> Tuesday -> Wednesday -> ... -> Sunday
void runDayByDayStartupTest() {
  Serial.println("\n==============================================================");
  Serial.println("  [STARTUP TEST] Progressive 7-Day LED Sequence Starting");
  Serial.println("  Monday -> Tuesday -> Wednesday -> Thursday -> Friday -> Sat -> Sun");
  Serial.println("==============================================================");

  for (int day = 0; day < 7; day++) {
    Serial.printf("[TEST DAY %d/7] Lighting %s\n", day + 1, DAY_NAMES[day]);
    updateShiftRegisters(DAY_MASKS[day]);
    digitalWrite(PIN_BUZZER, HIGH);
    delay(800); // Display each day for 800ms
    digitalWrite(PIN_BUZZER, LOW);
  }

  turnOffAllLeds();
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

  Wire.begin(21, 22); // I2C SDA=21, SCL=22

  pinMode(PIN_74HC595_DATA, OUTPUT);
  pinMode(PIN_74HC595_CLOCK, OUTPUT);
  pinMode(PIN_74HC595_LATCH, OUTPUT);
  pinMode(PIN_ACK_BUTTON, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);

  // Run the progressive 7-Day startup test sequence immediately on boot
  runDayByDayStartupTest();

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
        targetLed = payload.toInt();
      }

      // 1 to 28: Turn on specific single slot LED
      if (targetLed >= 1 && targetLed <= 28) {
        if (activeLedIndex != targetLed) {
          Serial.printf("[DEMO SUCCESS] >>> Web command: Turn ON LED #%d <<<\n", targetLed);
          activateLed(targetLed);
        }
      }
      // 30 to 36: Turn on entire Day (30 = Mon, 31 = Tue ... 36 = Sun)
      else if (targetLed >= 30 && targetLed <= 36) {
        int d = targetLed - 30;
        if (activeLedIndex != targetLed) {
          Serial.printf("[DEMO SUCCESS] >>> Web command: Lighting entire %s <<<\n", DAY_NAMES[d]);
          activeLedIndex = targetLed;
          alarmStartTime = millis();
          updateShiftRegisters(DAY_MASKS[d]);
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
        turnOffAllLeds();
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
        turnOffAllLeds();
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
