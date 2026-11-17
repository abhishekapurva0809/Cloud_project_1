/**
 * API Service for Virtual Smart Visitor Counter
 * Communicates with the Express backend, with automatic fallback simulation.
 */

const API_BASE = "/api/visitor";

export async function fetchDeviceStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend status unavailable, using fallback:", err);
    return null;
  }
}

export async function sendButtonPress(trigger = "HARDWARE_PUSHBUTTON") {
  try {
    const res = await fetch(`${API_BASE}/press`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend press unavailable, using fallback:", err);
    return null;
  }
}

export async function resetDeviceCounter() {
  try {
    const res = await fetch(`${API_BASE}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend reset unavailable, using fallback:", err);
    return null;
  }
}

export async function fetchEventHistory(limit = 20) {
  try {
    const res = await fetch(`${API_BASE}/history?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend history unavailable, using fallback:", err);
    return null;
  }
}

export async function fetchVisitorStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend stats unavailable, using fallback:", err);
    return null;
  }
}

// --- Real AWS Cloud API Functions ---

export async function fetchAwsConfig() {
  try {
    const res = await fetch(`${API_BASE}/aws-config`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch AWS config:", err);
    return null;
  }
}

export async function saveAwsConfig(configData) {
  try {
    const res = await fetch(`${API_BASE}/aws-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Could not save AWS config:", err);
    return { success: false, error: err.message };
  }
}

export async function testAwsConnection(credentials = {}) {
  try {
    const res = await fetch(`${API_BASE}/aws-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createAwsDynamoTable() {
  try {
    const res = await fetch(`${API_BASE}/aws-create-table`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
