/**
 * Real AWS Client for Smart Visitor Counter
 * Implements AWS Signature Version 4 (SigV4) using native Node.js crypto and fetch.
 * Zero external dependencies needed!
 * Supports:
 * - Amazon DynamoDB (Atomic UpdateItem, GetItem, DescribeTable, CreateTable)
 * - AWS IoT Core Data Plane (HTTP REST Publish)
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, "..", "aws-config.json");

// Default configuration
const defaultConfig = {
  mode: "SIMULATED", // "SIMULATED" or "REAL"
  region: "us-east-1",
  accessKeyId: "",
  secretAccessKey: "",
  sessionToken: "",
  dynamoDbTable: "IoT_VisitorCounter_Store",
  iotEndpoint: "",
  mqttTopic: "iot/smart-visitor/counter"
};

class AwsClientService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
        return { ...defaultConfig, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn("Could not load aws-config.json, using defaults:", err.message);
    }
    return { ...defaultConfig };
  }

  saveConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      mode: newConfig.mode || (newConfig.accessKeyId && newConfig.secretAccessKey ? "REAL" : "SIMULATED")
    };
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save aws-config.json:", err.message);
    }
    return this.getPublicConfig();
  }

  getPublicConfig() {
    return {
      mode: this.config.mode,
      region: this.config.region,
      dynamoDbTable: this.config.dynamoDbTable,
      iotEndpoint: this.config.iotEndpoint,
      mqttTopic: this.config.mqttTopic,
      hasCredentials: Boolean(this.config.accessKeyId && this.config.secretAccessKey),
      hasSessionToken: Boolean(this.config.sessionToken),
      accessKeyIdMasked: this.config.accessKeyId
        ? `${this.config.accessKeyId.slice(0, 4)}...${this.config.accessKeyId.slice(-4)}`
        : ""
    };
  }

  isConfigured() {
    return Boolean(
      this.config.mode === "REAL" &&
      this.config.accessKeyId &&
      this.config.secretAccessKey &&
      this.config.region
    );
  }

  // --- AWS Signature Version 4 Implementation ---
  signRequest({ service, method = "POST", host, canonicalUri = "/", queryParams = {}, headers = {}, payload = "" }) {
    const accessKey = this.config.accessKeyId;
    const secretKey = this.config.secretAccessKey;
    const sessionToken = this.config.sessionToken;
    const region = this.config.region;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);

    const payloadHash = crypto.createHash("sha256").update(payload, "utf8").digest("hex");

    // Standardize headers
    const reqHeaders = {
      ...headers,
      host,
      "x-amz-date": amzDate
    };
    if (sessionToken) {
      reqHeaders["x-amz-security-token"] = sessionToken;
    }

    // Canonical headers & signed headers
    const sortedHeaderKeys = Object.keys(reqHeaders)
      .map(k => k.toLowerCase())
      .sort();

    const canonicalHeaders = sortedHeaderKeys
      .map(k => `${k}:${reqHeaders[k].trim()}\n`)
      .join("");

    const signedHeaders = sortedHeaderKeys.join(";");

    // Canonical query string
    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
      .join("&");

    // Canonical request
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join("\n");

    // String to sign
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash("sha256").update(canonicalRequest, "utf8").digest("hex")
    ].join("\n");

    // Calculate signature
    const kDate = crypto.createHmac("sha256", "AWS4" + secretKey).update(dateStamp).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
    const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
    const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      headers: {
        ...reqHeaders,
        authorization: authorizationHeader
      }
    };
  }

  // --- Real DynamoDB Calls ---
  async testConnection() {
    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      return { success: false, error: "AWS Access Key ID and Secret Access Key are required." };
    }

    try {
      const host = `dynamodb.${this.config.region}.amazonaws.com`;
      const payload = JSON.stringify({ TableName: this.config.dynamoDbTable });
      const signed = this.signRequest({
        service: "dynamodb",
        method: "POST",
        host,
        canonicalUri: "/",
        headers: {
          "content-type": "application/x-amz-json-1.0",
          "x-amz-target": "DynamoDB_20120810.DescribeTable"
        },
        payload
      });

      const res = await fetch(`https://${host}/`, {
        method: "POST",
        headers: signed.headers,
        body: payload
      });

      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          tableExists: true,
          tableStatus: data.Table?.TableStatus,
          itemCount: data.Table?.ItemCount || 0,
          region: this.config.region,
          tableName: this.config.dynamoDbTable
        };
      }

      // Check if credentials are valid but table doesn't exist
      if (data.__type && data.__type.includes("ResourceNotFoundException")) {
        return {
          success: true,
          tableExists: false,
          region: this.config.region,
          tableName: this.config.dynamoDbTable,
          message: "AWS Credentials valid! But DynamoDB table does not exist yet. Click 'Create Table' to create it automatically."
        };
      }

      return {
        success: false,
        error: data.message || data.__type || "Failed to authenticate with AWS DynamoDB"
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async createTableIfNotExists() {
    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error("AWS Credentials are required to create a table.");
    }

    const host = `dynamodb.${this.config.region}.amazonaws.com`;
    const payload = JSON.stringify({
      TableName: this.config.dynamoDbTable,
      AttributeDefinitions: [
        { AttributeName: "deviceId", AttributeType: "S" }
      ],
      KeySchema: [
        { AttributeName: "deviceId", KeyType: "HASH" }
      ],
      BillingMode: "PAY_PER_REQUEST"
    });

    const signed = this.signRequest({
      service: "dynamodb",
      method: "POST",
      host,
      canonicalUri: "/",
      headers: {
        "content-type": "application/x-amz-json-1.0",
        "x-amz-target": "DynamoDB_20120810.CreateTable"
      },
      payload
    });

    const res = await fetch(`https://${host}/`, {
      method: "POST",
      headers: signed.headers,
      body: payload
    });

    const data = await res.json();
    if (!res.ok && !data.__type?.includes("ResourceInUseException")) {
      throw new Error(data.message || "Failed to create DynamoDB table");
    }

    return {
      success: true,
      tableName: this.config.dynamoDbTable,
      status: data.TableDescription?.TableStatus || "CREATING"
    };
  }

  async incrementDynamoDbVisitor(deviceId = "ESP32-S3-WROOM-01", amount = 1) {
    const host = `dynamodb.${this.config.region}.amazonaws.com`;
    const payload = JSON.stringify({
      TableName: this.config.dynamoDbTable,
      Key: {
        deviceId: { S: deviceId }
      },
      UpdateExpression: "ADD visitorCount :val SET lastUpdated = :now, deviceStatus = :online",
      ExpressionAttributeValues: {
        ":val": { N: String(amount) },
        ":now": { S: new Date().toISOString() },
        ":online": { S: "ONLINE" }
      },
      ReturnValues: "ALL_NEW"
    });

    const signed = this.signRequest({
      service: "dynamodb",
      method: "POST",
      host,
      canonicalUri: "/",
      headers: {
        "content-type": "application/x-amz-json-1.0",
        "x-amz-target": "DynamoDB_20120810.UpdateItem"
      },
      payload
    });

    const res = await fetch(`https://${host}/`, {
      method: "POST",
      headers: signed.headers,
      body: payload
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `DynamoDB Error (${res.status}): ${JSON.stringify(data)}`);
    }

    const currentCount = parseInt(data.Attributes?.visitorCount?.N || "0", 10);
    return {
      success: true,
      newCount: currentCount,
      lastUpdated: data.Attributes?.lastUpdated?.S,
      rawAttributes: data.Attributes
    };
  }

  async getDynamoDbVisitorCount(deviceId = "ESP32-S3-WROOM-01") {
    const host = `dynamodb.${this.config.region}.amazonaws.com`;
    const payload = JSON.stringify({
      TableName: this.config.dynamoDbTable,
      Key: {
        deviceId: { S: deviceId }
      }
    });

    const signed = this.signRequest({
      service: "dynamodb",
      method: "POST",
      host,
      canonicalUri: "/",
      headers: {
        "content-type": "application/x-amz-json-1.0",
        "x-amz-target": "DynamoDB_20120810.GetItem"
      },
      payload
    });

    const res = await fetch(`https://${host}/`, {
      method: "POST",
      headers: signed.headers,
      body: payload
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch DynamoDB item");
    }

    return parseInt(data.Item?.visitorCount?.N || "0", 10);
  }

  // --- Real AWS IoT Core HTTP Publish ---
  async publishToIotCore(payloadObject) {
    if (!this.config.iotEndpoint) {
      return { published: false, reason: "No IoT Endpoint specified" };
    }

    try {
      const host = this.config.iotEndpoint;
      const topic = this.config.mqttTopic;
      const canonicalUri = `/topics/${encodeURIComponent(topic)}`;
      const payload = JSON.stringify(payloadObject);

      const signed = this.signRequest({
        service: "iotdata",
        method: "POST",
        host,
        canonicalUri,
        queryParams: { qos: "1" },
        headers: {
          "content-type": "application/json"
        },
        payload
      });

      const res = await fetch(`https://${host}${canonicalUri}?qos=1`, {
        method: "POST",
        headers: signed.headers,
        body: payload
      });

      return {
        published: res.ok,
        status: res.status
      };
    } catch (err) {
      console.warn("Failed to publish to real IoT Core:", err.message);
      return { published: false, error: err.message };
    }
  }
}

export const awsClient = new AwsClientService();
