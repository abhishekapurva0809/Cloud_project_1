/**
 * In-memory Mock DynamoDB Store for Virtual Smart Visitor Counter
 * Replicates AWS DynamoDB table schemas and atomic updates.
 */

class MockDynamoDB {
  constructor() {
    this.reset();
  }

  reset() {
    this.deviceConfig = {
      deviceId: "ESP32-S3-WROOM-01",
      deviceName: "Smart Visitor Counter - Unit #1",
      location: "Lab Main Entrance - Gate A",
      macAddress: "24:6F:28:B4:9C:12",
      firmwareVersion: "v2.4.1-idf",
      wifiSsid: "IoT-LabNet-Secure",
      wifiRssi: -48, // dBm
      ipAddress: "192.168.1.142",
      gpioPin: 4,
      status: "ONLINE",
      awsEndpoint: "a3k8917x-ats.iot.us-east-1.amazonaws.com",
      mqttTopic: "iot/smart-visitor/counter",
      awsStatus: "CONNECTED",
      registeredAt: "2026-10-01T08:00:00.000Z"
    };

    this.counts = {
      current: 127,
      today: 127,
      total: 1842
    };

    const now = new Date();
    this.lastEventTime = new Date(now.getTime() - 25000);

    // Initial 8 events
    this.events = [
      {
        id: "evt-127",
        count: 127,
        timestamp: new Date(now.getTime() - 25000).toISOString(),
        timeFormatted: new Date(now.getTime() - 25000).toLocaleTimeString(),
        trigger: "HARDWARE_PUSHBUTTON",
        source: "ESP32 (GPIO 4)",
        awsLatencyMs: 42,
        status: "COMMITTED"
      },
      {
        id: "evt-126",
        count: 126,
        timestamp: new Date(now.getTime() - 72000).toISOString(),
        timeFormatted: new Date(now.getTime() - 72000).toLocaleTimeString(),
        trigger: "HARDWARE_PUSHBUTTON",
        source: "ESP32 (GPIO 4)",
        awsLatencyMs: 38,
        status: "COMMITTED"
      },
      {
        id: "evt-125",
        count: 125,
        timestamp: new Date(now.getTime() - 145000).toISOString(),
        timeFormatted: new Date(now.getTime() - 145000).toLocaleTimeString(),
        trigger: "HARDWARE_PUSHBUTTON",
        source: "ESP32 (GPIO 4)",
        awsLatencyMs: 45,
        status: "COMMITTED"
      },
      {
        id: "evt-124",
        count: 124,
        timestamp: new Date(now.getTime() - 210000).toISOString(),
        timeFormatted: new Date(now.getTime() - 210000).toLocaleTimeString(),
        trigger: "AUTO_SIMULATION",
        source: "ESP32 (GPIO 4)",
        awsLatencyMs: 39,
        status: "COMMITTED"
      },
      {
        id: "evt-123",
        count: 123,
        timestamp: new Date(now.getTime() - 315000).toISOString(),
        timeFormatted: new Date(now.getTime() - 315000).toLocaleTimeString(),
        trigger: "HARDWARE_PUSHBUTTON",
        source: "ESP32 (GPIO 4)",
        awsLatencyMs: 41,
        status: "COMMITTED"
      },
      {
        id: "evt-122",
        count: 122,
        timestamp: new Date(now.getTime() - 420000).toISOString(),
        timeFormatted: new Date(now.getTime() - 420000).toLocaleTimeString(),
        trigger: "HARDWARE_PUSHBUTTON",
        source: "ESP32 (GPIO 4)",
        awsLatencyMs: 44,
        status: "COMMITTED"
      }
    ];

    // Hourly statistics for activity chart
    this.hourlyStats = [
      { time: "08:00 AM", visitors: 14 },
      { time: "09:00 AM", visitors: 28 },
      { time: "10:00 AM", visitors: 45 },
      { time: "11:00 AM", visitors: 32 },
      { time: "12:00 PM", visitors: 18 },
      { time: "01:00 PM", visitors: 26 },
      { time: "02:00 PM", visitors: 39 },
      { time: "03:00 PM", visitors: 48 },
      { time: "04:00 PM", visitors: 36 },
      { time: "05:00 PM", visitors: 24 }
    ];
  }

  getStatus() {
    return {
      counts: { ...this.counts },
      device: { ...this.deviceConfig },
      lastEvent: {
        timestamp: this.lastEventTime.toISOString(),
        timeFormatted: this.lastEventTime.toLocaleTimeString(),
        description: `Visitor #${this.counts.current} detected`
      },
      systemStatus: "VIRTUAL_AWS_ONLINE",
      simulationEnvironment: "AWS IoT Core + Lambda + DynamoDB (Simulated)"
    };
  }

  incrementVisitor(trigger = "HARDWARE_PUSHBUTTON") {
    this.counts.current += 1;
    this.counts.today += 1;
    this.counts.total += 1;

    const now = new Date();
    this.lastEventTime = now;

    const newEvent = {
      id: `evt-${this.counts.current}-${Date.now().toString(36)}`,
      count: this.counts.current,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString(),
      trigger,
      source: "ESP32 (GPIO 4)",
      awsLatencyMs: Math.floor(Math.random() * 25) + 30, // 30-55ms
      status: "COMMITTED"
    };

    this.events.unshift(newEvent);
    if (this.events.length > 50) {
      this.events.pop();
    }

    // Update current hour in hourly stats
    const currentHourIndex = this.hourlyStats.length - 1;
    if (this.hourlyStats[currentHourIndex]) {
      this.hourlyStats[currentHourIndex].visitors += 1;
    }

    return {
      counts: { ...this.counts },
      newEvent,
      lastEvent: {
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString(),
        description: `Visitor #${this.counts.current} detected`
      }
    };
  }

  getEvents(limit = 20) {
    return this.events.slice(0, limit);
  }

  getHourlyStats() {
    return this.hourlyStats;
  }
}

export const db = new MockDynamoDB();
