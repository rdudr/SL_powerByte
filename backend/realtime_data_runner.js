#!/usr/bin/env node

/**
 * Real-Time Data Runner
 * 
 * Standalone Node.js script to stream 24-hour per-second CSV data in real-time
 * 
 * Features:
 * - Loads 24hr_per_second_offline_mode.csv
 * - Streams data per second to backend API
 * - Start/Stop controls
 * - Displays current time and data being sent
 * 
 * Usage:
 *   node realtime_data_runner.js
 * 
 * Commands:
 *   start - Start streaming data
 *   stop  - Stop streaming data
 *   exit  - Exit the program
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CSV_FILE = path.join(__dirname, '24hr_per_second_offline_mode_with_equipment.csv');
const API_URL = 'http://localhost:8000/api/realtime/data';
const STREAM_INTERVAL = 1000; // 1 second

// State
let isRunning = false;
let streamInterval = null;
let currentIndex = 0;
let csvData = [];
let startTime = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Load CSV file
 */
function loadCSV() {
  try {
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`${colors.red}✗ CSV file not found: ${CSV_FILE}${colors.reset}`);
      return false;
    }

    const content = fs.readFileSync(CSV_FILE, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      console.error(`${colors.red}✗ CSV file is empty${colors.reset}`);
      return false;
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows
    csvData = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, i) => {
        record[header] = values[i];
      });
      return record;
    });

    console.log(`${colors.green}✓ Loaded ${csvData.length} data points from CSV${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Error loading CSV: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Send data to API
 */
function sendDataToAPI(record) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      data: record,
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/realtime/data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(true);
        } else {
          reject(new Error(`API returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Stream data per second
 */
function startStreaming() {
  if (isRunning) {
    console.log(`${colors.yellow}⚠ Already streaming${colors.reset}`);
    return;
  }

  if (csvData.length === 0) {
    console.error(`${colors.red}✗ No data loaded. Load CSV first.${colors.reset}`);
    return;
  }

  isRunning = true;
  currentIndex = 0;
  startTime = Date.now();

  console.log(`${colors.green}▶ Starting data stream...${colors.reset}`);
  console.log(`${colors.cyan}Total data points: ${csvData.length}${colors.reset}`);

  streamInterval = setInterval(async () => {
    if (currentIndex >= csvData.length) {
      stopStreaming();
      console.log(`${colors.green}✓ Stream completed${colors.reset}`);
      return;
    }

    const record = csvData[currentIndex];
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const timeStr = record.time || 'N/A';
    const rxPower = record.RX_kWh || '0';
    const tx1Power = record.TX1_kWh || '0';
    const tx2Power = record.TX2_kWh || '0';

    try {
      await sendDataToAPI(record);
      console.log(
        `${colors.cyan}[${elapsedSeconds}s]${colors.reset} ` +
        `${colors.bright}${timeStr}${colors.reset} | ` +
        `RX: ${rxPower}kWh | TX1: ${tx1Power}kWh | TX2: ${tx2Power}kWh`
      );
    } catch (error) {
      console.error(
        `${colors.red}✗ Error sending data at ${timeStr}: ${error.message}${colors.reset}`
      );
    }

    currentIndex++;
  }, STREAM_INTERVAL);
}

/**
 * Stop streaming
 */
function stopStreaming() {
  if (!isRunning) {
    console.log(`${colors.yellow}⚠ Not currently streaming${colors.reset}`);
    return;
  }

  isRunning = false;
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
  }

  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  console.log(`${colors.red}⏹ Stream stopped${colors.reset}`);
  console.log(`${colors.cyan}Streamed ${currentIndex} data points in ${elapsedSeconds} seconds${colors.reset}`);
}

/**
 * Display status
 */
function displayStatus() {
  console.log(`\n${colors.bright}=== Real-Time Data Runner Status ===${colors.reset}`);
  console.log(`Status: ${isRunning ? `${colors.green}RUNNING${colors.reset}` : `${colors.red}STOPPED${colors.reset}`}`);
  console.log(`CSV File: ${CSV_FILE}`);
  console.log(`Total Data Points: ${csvData.length}`);
  console.log(`Current Index: ${currentIndex}/${csvData.length}`);
  if (isRunning && startTime) {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    console.log(`Elapsed Time: ${elapsedSeconds}s`);
  }
  console.log(`${colors.bright}Commands: start | stop | status | exit${colors.reset}\n`);
}

/**
 * Interactive CLI
 */
function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════╗
║   Real-Time Data Runner (Offline)      ║
║   24-Hour Per-Second CSV Streaming     ║
╚════════════════════════════════════════╝
${colors.reset}`);

  displayStatus();

  const promptUser = () => {
    rl.question(`${colors.bright}> ${colors.reset}`, (input) => {
      const command = input.trim().toLowerCase();

      switch (command) {
        case 'start':
          startStreaming();
          break;
        case 'stop':
          stopStreaming();
          break;
        case 'status':
          displayStatus();
          break;
        case 'exit':
          stopStreaming();
          console.log(`${colors.green}Goodbye!${colors.reset}`);
          rl.close();
          process.exit(0);
          break;
        case 'help':
          console.log(`
${colors.bright}Available Commands:${colors.reset}
  start  - Start streaming data from CSV
  stop   - Stop the current stream
  status - Display current status
  exit   - Exit the program
  help   - Show this help message
          `);
          break;
        default:
          if (command) {
            console.log(`${colors.yellow}Unknown command: ${command}${colors.reset}`);
          }
      }

      promptUser();
    });
  };

  promptUser();
}

/**
 * Main
 */
function main() {
  console.log(`${colors.cyan}Loading CSV file...${colors.reset}`);
  
  if (!loadCSV()) {
    process.exit(1);
  }

  // Check if command-line argument provided
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0] === 'auto-start') {
    // Auto-start streaming
    console.log(`${colors.green}Auto-starting stream...${colors.reset}`);
    startStreaming();
    
    // Keep running for specified duration or until stopped
    const duration = parseInt(args[1]) || 3600; // Default 1 hour
    setTimeout(() => {
      stopStreaming();
      console.log(`${colors.yellow}Auto-stop after ${duration}s${colors.reset}`);
      process.exit(0);
    }, duration * 1000);
  } else {
    // Interactive CLI
    startCLI();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Received interrupt signal${colors.reset}`);
  stopStreaming();
  process.exit(0);
});

// Start the application
main();
