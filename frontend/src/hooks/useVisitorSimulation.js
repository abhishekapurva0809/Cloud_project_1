import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchDeviceStatus,
  sendButtonPress,
  resetDeviceCounter,
  fetchEventHistory,
  fetchVisitorStats,
  fetchAwsConfig
} from "../services/api";
import {
  playClickSound,
  playReleaseSound,
  playCloudBeep,
  playResetSound
} from "../components/Audio/soundEffects";

const INITIAL_DEVICE = {
  deviceId: "ESP32-S3-WROOM-01",
  deviceName: "Smart Visitor Counter - Unit #1",
  location: "Lab Main Entrance - Gate A",
  macAddress: "24:6F:28:B4:9C:12",
  firmwareVersion: "v2.4.1-idf",
  wifiSsid: "IoT-LabNet-Secure",
  wifiRssi: -48,
  ipAddress: "192.168.1.142",
  gpioPin: 4,
  status: "ONLINE",
  awsEndpoint: "a3k8917x-ats.iot.us-east-1.amazonaws.com",
  mqttTopic: "iot/smart-visitor/counter",
  awsStatus: "CONNECTED"
};

export function useVisitorSimulation() {
  const [counts, setCounts] = useState({ current: 127, today: 127, total: 1842 });
  const [device, setDevice] = useState(INITIAL_DEVICE);
  const [awsConfig, setAwsConfig] = useState({
    mode: "SIMULATED",
    region: "us-east-1",
    dynamoDbTable: "IoT_VisitorCounter_Store",
    hasCredentials: false
  });
  const [isPressed, setIsPressed] = useState(false);
  const [ledActive, setLedActive] = useState(false);
  const [cloudActiveStep, setCloudActiveStep] = useState(0); // 0=idle, 1=ESP32, 2=IoT Core, 3=Lambda, 4=DynamoDB, 5=Dashboard
  const [pipelineProgress, setPipelineProgress] = useState(0); // 0-100% continuous
  const [lastEvent, setLastEvent] = useState({
    timestamp: new Date().toISOString(),
    timeFormatted: new Date().toLocaleTimeString(),
    description: "Visitor #127 detected"
  });
  const [eventHistory, setEventHistory] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [hourlyStats, setHourlyStats] = useState([
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
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(3.0); // seconds between auto presses
  const [inspectedComponent, setInspectedComponent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // References for animation and timer handles
  const simTimerRef = useRef(null);
  const rafIdRef = useRef(null);
  const activeTimersRef = useRef([]);

  const safeSetTimeout = (fn, delay) => {
    const id = setTimeout(() => {
      activeTimersRef.current = activeTimersRef.current.filter(t => t !== id);
      fn();
    }, delay);
    activeTimersRef.current.push(id);
    return id;
  };

  const clearAllTimers = () => {
    activeTimersRef.current.forEach(id => clearTimeout(id));
    activeTimersRef.current = [];
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const reloadAwsConfig = async () => {
    const res = await fetchAwsConfig();
    if (res?.data) {
      setAwsConfig(res.data);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    let isMounted = true;
    async function init() {
      const statusRes = await fetchDeviceStatus();
      if (isMounted && statusRes?.data) {
        setCounts(statusRes.data.counts);
        setDevice(statusRes.data.device);
        setLastEvent(statusRes.data.lastEvent);
        if (statusRes.data.aws) {
          setAwsConfig(statusRes.data.aws);
        }
      }

      const awsRes = await fetchAwsConfig();
      if (isMounted && awsRes?.data) {
        setAwsConfig(awsRes.data);
      }

      const histRes = await fetchEventHistory(10);
      if (isMounted && histRes?.data) {
        setEventHistory(histRes.data);
      } else if (isMounted) {
        setEventHistory([
          { id: "e-127", count: 127, timeFormatted: new Date(Date.now() - 30000).toLocaleTimeString(), trigger: "HARDWARE_PUSHBUTTON", awsLatencyMs: 42, status: "COMMITTED" },
          { id: "e-126", count: 126, timeFormatted: new Date(Date.now() - 75000).toLocaleTimeString(), trigger: "HARDWARE_PUSHBUTTON", awsLatencyMs: 38, status: "COMMITTED" },
          { id: "e-125", count: 125, timeFormatted: new Date(Date.now() - 140000).toLocaleTimeString(), trigger: "AUTO_SIMULATION", awsLatencyMs: 45, status: "COMMITTED" },
          { id: "e-124", count: 124, timeFormatted: new Date(Date.now() - 210000).toLocaleTimeString(), trigger: "HARDWARE_PUSHBUTTON", awsLatencyMs: 39, status: "COMMITTED" }
        ]);
      }

      const statsRes = await fetchVisitorStats();
      if (isMounted && statsRes?.data?.hourly) {
        setHourlyStats(statsRes.data.hourly);
      }
    }
    init();

    const nowStr = new Date().toLocaleTimeString();
    setLiveLogs([
      { id: "l-init-1", time: nowStr, level: "INFO", source: "SYSTEM", message: "Virtual IoT Laboratory ready (Cloud-first telemetry verified)" },
      { id: "l-init-2", time: nowStr, level: "INFO", source: "ESP32", message: "GPIO 4 ISR armed with hardware contact debounce" },
      { id: "l-init-3", time: nowStr, level: "SUCCESS", source: "AWS IoT", message: "MQTT TLS 1.3 socket connected: iot/smart-visitor/counter" }
    ]);

    return () => {
      isMounted = false;
      clearAllTimers();
    };
  }, []);

  // Main Action: Trigger Button Press
  // Flow:
  // 1. Button moves down, audio clicks, LED flashes
  // 2. Data packet travels across Cloud Architecture: ESP32 -> IoT Core -> Lambda -> DynamoDB -> Dashboard
  // 3. AFTER cloud process completes, THEN visitor count increments on both 3D OLED model & dashboard!
  const triggerButtonPress = useCallback(async (sourceTrigger = "HARDWARE_PUSHBUTTON") => {
    // Prevent overlapping pipeline executions
    if (isProcessing) return;
    setIsProcessing(true);

    const now = new Date();
    const timeString = now.toLocaleTimeString();

    // 1. Immediate physical tactile feedback
    setIsPressed(true);
    playClickSound();
    setLedActive(true);

    // Initial hardware log
    const logItem1 = {
      id: `log-${Date.now()}-1`,
      time: timeString,
      level: "EVENT",
      source: "ESP32",
      message: `GPIO 4 interrupt detected falling edge (0V). Initiating cloud transmission...`
    };
    setLiveLogs(prev => [logItem1, ...prev.slice(0, 39)]);

    // Release tactile press state after spring stroke (~180ms)
    safeSetTimeout(() => {
      setIsPressed(false);
      playReleaseSound();
    }, 180);

    // Keep LED illuminated for ~750ms with smooth analog decay
    safeSetTimeout(() => {
      setLedActive(false);
    }, 750);

    // Start background API call to backend early so it's ready when animation reaches the end
    const backendPromise = sendButtonPress(sourceTrigger).catch(err => {
      console.warn("Backend call fallback:", err);
      return null;
    });

    // 2. Continuous 60 FPS Cloud Pipeline Simulation
    const startTime = performance.now();
    const PIPELINE_DURATION = 1100; // ms for full cloud pipeline trip
    let loggedStage2 = false;
    let loggedStage3 = false;
    let loggedStage4 = false;

    const animatePipeline = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / PIPELINE_DURATION);

      // Smooth ease-out cubic curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setPipelineProgress(easedProgress * 100);

      // Stage 1: ESP32 (0% - 20%)
      if (progress < 0.2) {
        setCloudActiveStep(1);
      }
      // Stage 2: AWS IoT Core (20% - 42%)
      else if (progress < 0.42) {
        setCloudActiveStep(2);
        if (!loggedStage2) {
          loggedStage2 = true;
          const logItem2 = {
            id: `log-${Date.now()}-2`,
            time: new Date().toLocaleTimeString(),
            level: "INFO",
            source: "AWS IoT",
            message: `MQTT PUB to '${device.mqttTopic}' QoS 1. Topic Rule matched.`
          };
          setLiveLogs(prev => [logItem2, ...prev.slice(0, 39)]);
        }
      }
      // Stage 3: AWS Lambda (42% - 68%)
      else if (progress < 0.68) {
        setCloudActiveStep(3);
        if (!loggedStage3) {
          loggedStage3 = true;
          const logItem3 = {
            id: `log-${Date.now()}-3`,
            time: new Date().toLocaleTimeString(),
            level: "INFO",
            source: "Lambda",
            message: `Function 'processVisitorCounter' invoked. Executing DynamoDB atomic increment.`
          };
          setLiveLogs(prev => [logItem3, ...prev.slice(0, 39)]);
        }
      }
      // Stage 4: Amazon DynamoDB (68% - 88%)
      else if (progress < 0.88) {
        setCloudActiveStep(4);
        if (!loggedStage4) {
          loggedStage4 = true;
          const logItem4 = {
            id: `log-${Date.now()}-4`,
            time: new Date().toLocaleTimeString(),
            level: "SUCCESS",
            source: "DynamoDB",
            message: `UpdateItem committed: Table 'IoT_VisitorCounter_Store' atomic ADD :inc.`
          };
          setLiveLogs(prev => [logItem4, ...prev.slice(0, 39)]);
        }
      }
      // Stage 5: Web Dashboard Synchronization (88% - 100%)
      else {
        setCloudActiveStep(5);
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animatePipeline);
      } else {
        // --- STAGE 5 REACHED: NOW INCREMENT VISITOR COUNT! ---
        finishPipelineAndIncrement();
      }
    };

    rafIdRef.current = requestAnimationFrame(animatePipeline);

    const finishPipelineAndIncrement = async () => {
      const apiResponse = await backendPromise;

      let newCount;
      if (apiResponse?.counts) {
        newCount = apiResponse.counts.current;
        setCounts(apiResponse.counts);
        if (apiResponse.newEvent) {
          setEventHistory(prev => [apiResponse.newEvent, ...prev.slice(0, 19)]);
        }
        if (apiResponse.lastEvent) {
          setLastEvent(apiResponse.lastEvent);
        }
      } else {
        // Fallback local update ONLY AFTER CLOUD TRIP COMPLETES
        setCounts(prev => {
          newCount = prev.current + 1;
          return {
            current: newCount,
            today: prev.today + 1,
            total: prev.total + 1
          };
        });

        const fallbackEvt = {
          id: `evt-${Date.now()}`,
          count: counts.current + 1,
          timestamp: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString(),
          trigger: sourceTrigger,
          source: "ESP32 (GPIO 4)",
          awsLatencyMs: Math.floor(Math.random() * 20) + 32,
          status: "COMMITTED"
        };
        setEventHistory(prev => [fallbackEvt, ...prev.slice(0, 19)]);
        setLastEvent({
          timestamp: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString(),
          description: `Visitor #${counts.current + 1} detected`
        });
        newCount = counts.current + 1;
      }

      // Update hourly stats graph
      setHourlyStats(prev => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (copy[lastIdx]) {
          copy[lastIdx] = { ...copy[lastIdx], visitors: copy[lastIdx].visitors + 1 };
        }
        return copy;
      });

      // Play cloud confirmation chime
      playCloudBeep();

      const isReal = apiResponse?.isRealAws || (awsConfig?.mode === "REAL" && awsConfig?.hasCredentials);
      const logItem5 = {
        id: `log-${Date.now()}-5`,
        time: new Date().toLocaleTimeString(),
        level: "SUCCESS",
        source: isReal ? "Amazon DynamoDB" : "Dashboard",
        message: isReal
          ? `Real AWS pipeline complete! Atomically written to DynamoDB (${awsConfig?.region || 'AWS'}) -> #${newCount} live on 3D OLED & Dashboard.`
          : `Cloud pipeline complete! Visitor count incremented to #${newCount} on 3D OLED & Dashboard.`
      };
      setLiveLogs(prev => [logItem5, ...prev.slice(0, 39)]);

      // Cleanly reset pipeline state after brief hold
      safeSetTimeout(() => {
        setCloudActiveStep(0);
        setPipelineProgress(0);
        setIsProcessing(false);
      }, 300);
    };

  }, [isProcessing, counts, device]);

  // Handle auto simulation mode timer
  useEffect(() => {
    if (isSimulating) {
      simTimerRef.current = setInterval(() => {
        triggerButtonPress("AUTO_SIMULATION");
      }, simSpeed * 1000);
    } else {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    }

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, simSpeed, triggerButtonPress]);

  // Reset functionality with clean timer disposal
  const handleReset = async () => {
    setIsSimulating(false);
    clearAllTimers();
    playResetSound();

    let res = null;
    try {
      res = await resetDeviceCounter();
    } catch {
      // offline fallback
    }

    if (res?.data) {
      setCounts(res.data.counts);
      setLastEvent(res.data.lastEvent);
    } else {
      setCounts({ current: 127, today: 127, total: 1842 });
      setLastEvent({
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString(),
        description: "Visitor #127 detected"
      });
    }

    setCloudActiveStep(0);
    setPipelineProgress(0);
    setLedActive(false);
    setIsPressed(false);
    setIsProcessing(false);

    const nowStr = new Date().toLocaleTimeString();
    setLiveLogs(prev => [
      {
        id: `log-${Date.now()}-reset`,
        time: nowStr,
        level: "WARN",
        source: "SYSTEM",
        message: "System counter reset back to benchmark #127"
      },
      ...prev.slice(0, 39)
    ]);
  };

  const toggleSimulation = () => {
    setIsSimulating(prev => !prev);
  };

  return {
    counts,
    device,
    awsConfig,
    reloadAwsConfig,
    isPressed,
    ledActive,
    cloudActiveStep,
    pipelineProgress,
    lastEvent,
    eventHistory,
    liveLogs,
    hourlyStats,
    isSimulating,
    simSpeed,
    setSimSpeed,
    inspectedComponent,
    setInspectedComponent,
    isProcessing,
    triggerButtonPress,
    toggleSimulation,
    handleReset
  };
}
