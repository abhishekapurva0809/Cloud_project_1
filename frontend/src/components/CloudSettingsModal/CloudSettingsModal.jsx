import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  Key, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Radio, 
  Zap, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Server,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  fetchAwsConfig, 
  saveAwsConfig, 
  testAwsConnection, 
  createAwsDynamoTable 
} from "../../services/api";

export default function CloudSettingsModal({ isOpen, onClose, onConfigUpdated }) {
  const [mode, setMode] = useState("SIMULATED"); // "SIMULATED" or "REAL"
  const [region, setRegion] = useState("us-east-1");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [dynamoDbTable, setDynamoDbTable] = useState("IoT_VisitorCounter_Store");
  const [iotEndpoint, setIotEndpoint] = useState("");
  const [mqttTopic, setMqttTopic] = useState("iot/smart-visitor/counter");

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [creatingTable, setCreatingTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showIamGuide, setShowIamGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const loadConfig = async () => {
    const res = await fetchAwsConfig();
    if (res?.data) {
      setMode(res.data.mode || "SIMULATED");
      setRegion(res.data.region || "us-east-1");
      setDynamoDbTable(res.data.dynamoDbTable || "IoT_VisitorCounter_Store");
      setIotEndpoint(res.data.iotEndpoint || "");
      setMqttTopic(res.data.mqttTopic || "iot/smart-visitor/counter");
      if (res.data.accessKeyIdMasked) {
        setAccessKeyId(res.data.accessKeyIdMasked);
      }
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const payload = {
        mode,
        region,
        dynamoDbTable,
        iotEndpoint,
        mqttTopic
      };
      if (accessKeyId && !accessKeyId.includes("...")) {
        payload.accessKeyId = accessKeyId;
      }
      if (secretAccessKey) {
        payload.secretAccessKey = secretAccessKey;
      }
      if (sessionToken) {
        payload.sessionToken = sessionToken;
      }

      const res = await testAwsConnection(payload);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleCreateTable = async () => {
    setCreatingTable(true);
    try {
      const res = await createAwsDynamoTable();
      if (res.success) {
        await handleTestConnection();
      } else {
        setTestResult({ success: false, error: res.error || "Failed to create table" });
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setCreatingTable(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        mode,
        region,
        dynamoDbTable,
        iotEndpoint,
        mqttTopic
      };
      if (accessKeyId && !accessKeyId.includes("...")) {
        payload.accessKeyId = accessKeyId;
      }
      if (secretAccessKey) {
        payload.secretAccessKey = secretAccessKey;
      }
      if (sessionToken) {
        payload.sessionToken = sessionToken;
      }

      const res = await saveAwsConfig(payload);
      if (res?.success) {
        setSaveSuccess(true);
        if (onConfigUpdated) onConfigUpdated(res.data);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchToSimulation = async () => {
    setSaving(true);
    try {
      const res = await saveAwsConfig({ mode: "SIMULATED" });
      if (res?.success) {
        setMode("SIMULATED");
        if (onConfigUpdated) onConfigUpdated(res.data);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 800);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0d131f] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                AWS Cloud Connectivity
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                  mode === "REAL" 
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" 
                    : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                }`}>
                  {mode === "REAL" ? "Real Cloud Target" : "Virtual Simulation"}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Connect the 3D ESP32 device directly to your live AWS account
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs sm:text-sm font-sans">
          
          {/* Mode Switch Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white text-sm">Operating Mode</div>
              <div className="text-xs text-slate-400 font-mono">
                {mode === "REAL" 
                  ? "Writing every 3D button press straight into live Amazon DynamoDB & AWS IoT Core." 
                  : "Using high-fidelity local virtual simulation with accurate AWS request telemetry."}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#080d17] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setMode("SIMULATED")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                  mode === "SIMULATED"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Simulation
              </button>
              <button
                type="button"
                onClick={() => setMode("REAL")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                  mode === "REAL"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Real AWS Cloud
              </button>
            </div>
          </div>

          {/* Form Fields for Real AWS */}
          <div className="space-y-4">
            {/* AWS Region & Table Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  AWS Region <span className="text-amber-400">*</span>
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full bg-[#080d17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="us-east-1">us-east-1 (N. Virginia)</option>
                  <option value="us-east-2">us-east-2 (Ohio)</option>
                  <option value="us-west-1">us-west-1 (N. California)</option>
                  <option value="us-west-2">us-west-2 (Oregon)</option>
                  <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                  <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  <option value="eu-west-1">eu-west-1 (Ireland)</option>
                  <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  DynamoDB Table Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={dynamoDbTable}
                  onChange={e => setDynamoDbTable(e.target.value)}
                  placeholder="IoT_VisitorCounter_Store"
                  className="w-full bg-[#080d17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* AWS Credentials */}
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  AWS IAM Credentials (SigV4 Signed)
                </span>
                <span className="text-[11px] text-slate-500">Stored safely in backend/aws-config.json</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  AWS Access Key ID
                </label>
                <input
                  type="text"
                  value={accessKeyId}
                  onChange={e => setAccessKeyId(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full bg-[#080d17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  AWS Secret Access Key
                </label>
                <input
                  type="password"
                  value={secretAccessKey}
                  onChange={e => setSecretAccessKey(e.target.value)}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full bg-[#080d17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                  <span>AWS Session Token (Optional)</span>
                  <span className="text-[10px] text-slate-500">Required if using AWS Academy / Learner Lab / SSO</span>
                </label>
                <input
                  type="password"
                  value={sessionToken}
                  onChange={e => setSessionToken(e.target.value)}
                  placeholder="AQoDYXdzEJr... (Leave empty for standard permanent IAM user)"
                  className="w-full bg-[#080d17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* IoT Core Optional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  AWS IoT Endpoint (Optional)
                </label>
                <input
                  type="text"
                  value={iotEndpoint}
                  onChange={e => setIotEndpoint(e.target.value)}
                  placeholder="xxxxxx-ats.iot.us-east-1.amazonaws.com"
                  className="w-full bg-[#080d17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  MQTT Topic
                </label>
                <input
                  type="text"
                  value={mqttTopic}
                  onChange={e => setMqttTopic(e.target.value)}
                  placeholder="iot/smart-visitor/counter"
                  className="w-full bg-[#080d17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Test Result Callout */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
              testResult.success 
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <span>
                  {testResult.success ? "AWS Authentication Succeeded!" : "AWS Authentication Failed"}
                </span>
              </div>

              {testResult.success && testResult.tableExists && (
                <div className="text-[11px] text-emerald-200">
                  DynamoDB Table <code className="font-bold underline">{testResult.tableName}</code> is ready and active ({testResult.tableStatus || "ACTIVE"}). Ready to receive live button clicks!
                </div>
              )}

              {testResult.success && !testResult.tableExists && (
                <div className="space-y-2">
                  <div className="text-[11px] text-amber-300">
                    Your AWS credentials are valid, but the table <strong>{dynamoDbTable}</strong> was not found in region {region}.
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateTable}
                    disabled={creatingTable}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {creatingTable ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    Create Table Automatically Now
                  </button>
                </div>
              )}

              {!testResult.success && (
                <div className="text-[11px] text-red-200 break-words">
                  {testResult.error}
                </div>
              )}
            </div>
          )}

          {/* IAM Policy Help Accordion */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
            <button
              type="button"
              onClick={() => setShowIamGuide(!showIamGuide)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                IAM Permissions Guide (What permissions are required?)
              </span>
              {showIamGuide ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {showIamGuide && (
              <div className="p-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-400 font-mono">
                <p>
                  To allow the 3D laboratory to write directly to Amazon DynamoDB and publish to AWS IoT Core, create an IAM user or role with these actions:
                </p>
                <div className="p-2.5 bg-black/60 rounded-lg text-cyan-300 text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify({
                    "Version": "2012-10-17",
                    "Statement": [
                      {
                        "Effect": "Allow",
                        "Action": [
                          "dynamodb:UpdateItem",
                          "dynamodb:GetItem",
                          "dynamodb:DescribeTable",
                          "dynamodb:CreateTable"
                        ],
                        "Resource": `arn:aws:dynamodb:*:${region}:table/${dynamoDbTable}`
                      },
                      {
                        "Effect": "Allow",
                        "Action": [
                          "iot:Publish"
                        ],
                        "Resource": `arn:aws:iot:*:${region}:topic/${mqttTopic}`
                      }
                    ]
                  }, null, 2)}</pre>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tip: For academic or student accounts (like AWS Academy), paste the session token from the AWS Details panel.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
              Test AWS Credentials
            </button>

            {mode === "REAL" && (
              <button
                type="button"
                onClick={handleSwitchToSimulation}
                className="text-xs font-mono text-slate-400 hover:text-cyan-300 underline underline-offset-4"
              >
                Revert to Simulation
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-mono text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2 rounded-xl font-mono text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                saveSuccess
                  ? "bg-emerald-600 shadow-emerald-900/50"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40"
              }`}
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              {saveSuccess ? "Connected!" : "Save & Activate"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
