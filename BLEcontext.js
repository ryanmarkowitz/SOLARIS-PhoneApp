import React, { createContext, useContext, useMemo, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { toByteArray, fromByteArray } from 'base64-js';
import { useAuth } from '@clerk/clerk-expo';
import config from "./config";

const SERVICE_UUID     = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d0";
const TELEMETRY_UUID   = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d1";
const CONTROL_UUID     = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d2";
const MODE_UUID        = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d3";
const TIME_SYNC_UUID   = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d4";
const WEATHER_UUID     = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d5";
const MANUAL_CTRL_UUID = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d6";

const MODES = {
  0: 'stationary',
  1: 'automatic',
  2: 'manual',
};

const MODE_BYTES = {
  'stationary': 0,
  'automatic': 1,
  'manual': 2,
};

const BLEContext = createContext(null);

export function BLEProvider({ children }) {
  const { getToken } = useAuth();
  const manager = useMemo(() => new BleManager(), []);

  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  async function requestPermissions() {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();
      if (apiLevel < 31) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === 'granted';
      } else {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          result['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          result['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
          result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        );
      }
    }
    return true;
  }

  function scanForRobot(onDeviceFound) {
    setIsScanning(true);
    const subscription = manager.onStateChange((state) => {
      console.log('BLE state:', state);
      if (state === 'PoweredOn') {
        subscription.remove();
        try {
          manager.startDeviceScan(null, {}, (error, device) => {
            if (error) {
              console.error('Scan error:', error);
              setIsScanning(false);
              return;
            }
            if (device && device.name === 'SOLARIS') {
              console.log('SOLARIS device found:', device.id);
              manager.stopDeviceScan();
              setIsScanning(false);
              onDeviceFound(device);
            }
          });
        } catch (e) {
          console.error('startDeviceScan threw:', e);
          setIsScanning(false);
        }
      }
    }, true);
  }

  async function connectToRobot(device) {
    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      setIsConnected(true);

      manager.onDeviceDisconnected(connected.id, () => {
        setConnectedDevice(null);
        setIsConnected(false);
      });

      return connected;
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
      return null;
    }
  }

  async function syncTime(device) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const buf = new ArrayBuffer(4);
      const view = new DataView(buf);
      view.setUint32(0, timestamp, true);
      const bytes = new Uint8Array(buf);
      const base64 = fromByteArray(bytes);
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        TIME_SYNC_UUID,
        base64
      );
      console.log('Time sync sent:', timestamp);
    } catch (error) {
      console.error('Time sync error:', error);
    }
  }

  async function readMode(device) {
    try {
      const characteristic = await device.readCharacteristicForService(
        SERVICE_UUID,
        MODE_UUID
      );
      const bytes = toByteArray(characteristic.value);
      return MODES[bytes[0]] ?? 'unknown';
    } catch (error) {
      console.error('Read mode error:', error);
      return null;
    }
  }

  async function writeMode(device, mode) {
    try {
      const modeByte = MODE_BYTES[mode];
      if (modeByte === undefined) {
        console.error('Invalid mode:', mode);
        return;
      }
      const bytes = new Uint8Array([modeByte]);
      const base64 = fromByteArray(bytes);
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        MODE_UUID,
        base64
      );
      console.log('Mode set to:', mode);
    } catch (error) {
      console.error('Write mode error:', error);
    }
  }

  async function writeManualControl(device, throttle, steering) {
    try {
      const throttleByte = Math.round(throttle * 127);
      const steeringByte = Math.round(steering * 127);
      const buf = new ArrayBuffer(2);
      const view = new DataView(buf);
      view.setInt8(0, throttleByte);
      view.setInt8(1, steeringByte);
      const bytes = new Uint8Array(buf);
      const base64 = fromByteArray(bytes);
      await device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        MANUAL_CTRL_UUID,
        base64
      );
    } catch (error) {
      console.error('Manual control error:', error);
    }
  }

  async function writeWeather(device, weatherData) {
    try {
      const { sunrise, sunset, forecast } = weatherData;
      const buf = new ArrayBuffer(152);
      const view = new DataView(buf);
      let offset = 0;
      view.setUint32(offset, sunrise, true);
      offset += 4;
      view.setUint32(offset, sunset, true);
      offset += 4;
      for (let i = 0; i < 24; i++) {
        const entry = forecast[i];
        view.setUint32(offset, entry.time, true);
        offset += 4;
        view.setUint8(offset, entry.cloud_cover_pct);
        offset += 1;
        view.setUint8(offset, entry.precip_probability_pct);
        offset += 1;
      }
      const bytes = new Uint8Array(buf);
      const base64 = fromByteArray(bytes);
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        WEATHER_UUID,
        base64
      );
      console.log('Weather written successfully');
    } catch (error) {
      console.error('Weather write error:', error);
    }
  }

  function parseTelemetryPage(base64Value) {
    const bytes = toByteArray(base64Value);
    const view = new DataView(bytes.buffer);
    const pageIndex = view.getUint8(0);
    const totalPages = view.getUint8(1);
    const recordCount = view.getUint8(2);
    const records = [];
    let offset = 3;
    for (let i = 0; i < recordCount; i++) {
      const timestamp = view.getUint32(offset, true);
      const battery_percent = view.getUint8(offset + 4);
      const distance_m = view.getUint32(offset + 5, true);
      const net_power_gain_w = view.getInt32(offset + 9, true);
      offset += 13;
      records.push({ timestamp, battery_percent, distance_m, net_power_gain_w });
    }
    return { pageIndex, totalPages, recordCount, records };
  }

  async function writeControlCommand(device, command) {
    const bytes = new Uint8Array([command]);
    const base64 = fromByteArray(bytes);
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CONTROL_UUID,
      base64
    );
  }

  async function syncTelemetry(device) {
    const allRecords = [];

    await new Promise((resolve, reject) => {
      const subscription = device.monitorCharacteristicForService(
        SERVICE_UUID,
        TELEMETRY_UUID,
        async (error, characteristic) => {
          try {
            if (error) throw error;

            const { pageIndex, totalPages, recordCount, records } = parseTelemetryPage(characteristic.value);

            if (totalPages === 0) {
              console.log('No new telemetry data');
              subscription.remove();
              resolve();
              return;
            }

            allRecords.push(...records);
            console.log(`Received page ${pageIndex + 1}/${totalPages} (${recordCount} records)`);

            await writeControlCommand(device, 0x02);

            if (pageIndex + 1 === totalPages) {
              const token = await getToken();
              const response = await fetch(`${config.apiUrl}/telemetry`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(allRecords),
              });

              if (!response.ok) throw new Error(`Backend error: ${response.status}`);

              await writeControlCommand(device, 0x03);
              console.log('Telemetry sync complete, logs cleared');
              subscription.remove();
              resolve({ success: true, recordCount: allRecords.length });
            }
          } catch (err) {
            subscription.remove();
            reject(err);
          }
        }
      );

      writeControlCommand(device, 0x01).catch(reject);
    });
  }

  return (
    <BLEContext.Provider value={{
      connectedDevice,
      isConnected,
      isScanning,
      requestPermissions,
      scanForRobot,
      connectToRobot,
      syncTime,
      readMode,
      writeMode,
      writeManualControl,
      writeWeather,
      syncTelemetry,
    }}>
      {children}
    </BLEContext.Provider>
  );
}

export function useBLE() {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error('useBLE must be used within a BLEProvider');
  }
  return context;
}