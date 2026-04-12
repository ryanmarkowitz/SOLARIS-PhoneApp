import { useMemo, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { toByteArray, fromByteArray } from 'base64-js';
import config from "../config";
import { useAuth } from '@clerk/clerk-expo';

const SERVICE_UUID     = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d0";
const TELEMETRY_UUID   = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d1";
const CONTROL_UUID     = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d2";
const MODE_UUID        = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d3";
const TIME_SYNC_UUID   = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d4";
const WEATHER_UUID     = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d5";
const MANUAL_CTRL_UUID = "5c4b3a29-1807-f6e5-d4c3-b2a1000000d6";

export function useBLE() {
    // used to map current mode in readMode function
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
        // iOS handles permessions at startup
        return true;
    }

    function scanForRobot(onDeviceFound) {
        setIsScanning(true);

        manager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
        if (error) {
            console.error('Scan error:', error);
            setIsScanning(false);
            return;
        }

        if (device) {
            manager.stopDeviceScan();
            setIsScanning(false);
            onDeviceFound(device);
        }
        });
    }

    async function connectToRobot(device) {
        try {
            const connected = await device.connect();
            await connected.discoverAllServicesAndCharacteristics();
            setConnectedDevice(connected);
            setIsConnected(true);

            // listen for disconnection
            manager.onDeviceDisconnected(connected.id, () => {
                setConnectedDevice(null);
                setIsConnected(false);
            });

            return connected;
        } 

        catch (error) {
            console.error('Connection error:', error);
            setIsConnected(false);
            return null;
        }
    }

    // handles sending the 32 bit unix timestamp to the ESP device
    async function syncTime(device) {
        try {
            const timestamp = Math.floor(Date.now() / 1000); // unix timestamp in seconds

            const buf = new ArrayBuffer(4);
            const view = new DataView(buf);
            view.setUint32(0, timestamp, true); // true = little-endian

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
    
    // reads current mode from device i.e. stationary, automatic, or manual
    async function readMode(device) {
        try {
            const characteristic = await device.readCharacteristicForService(
                SERVICE_UUID,
                MODE_UUID
            );

            const bytes = toByteArray(characteristic.value);
            return MODES[bytes[0]] ?? 'unkown'; // 0 = stationary, 1 = automatic, 2 = manual
        } 
        catch (error) {
            console.error('Read mode error:', error);
            return null;
        }
    }

    // writes to the mode characteristic, changing the robot's mode
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
        } 
        catch (error) {
            console.error('Write mode error:', error);
        }
    }

    async function writeManualControl(device, throttle, steering) {
        try {
            // throttle and steering come in as -1 to 1 floats
            const throttleByte = Math.round(throttle * 127);
            const steeringByte = Math.round(steering * 127);

            const buf = new ArrayBuffer(2);
            const view = new DataView(buf);
            view.setInt8(0, throttleByte);  // signed int8
            view.setInt8(1, steeringByte);

            const bytes = new Uint8Array(buf);
            const base64 = fromByteArray(bytes);

            await device.writeCharacteristicWithoutResponseForService(
                SERVICE_UUID,
                MANUAL_CTRL_UUID,
                base64
            );
        } 
        catch (error) {
            console.error('Manual control error:', error);
        }
    }
    
    // this function takes json of weather forecast recieved from backend and sends it to the ESP
    async function writeWeather(device, weatherData) {
        try {
            const { sunrise, sunset, forecast } = weatherData;

            // 152 bytes total:
            // 4 bytes sunrise + 4 bytes sunset + 24 * (4 + 1 + 1) = 144 bytes forecast
            const buf = new ArrayBuffer(152);
            const view = new DataView(buf);
            let offset = 0;

            // sunrise and sunset
            view.setUint32(offset, sunrise, true);
            offset += 4;
            view.setUint32(offset, sunset, true);
            offset += 4;

            // 24 hourly forecast entries
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
        } 
        catch (error) {
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
            const timestamp = view.getUint32(offset, true);       // little-endian
            const battery_percent = view.getUint8(offset + 4);
            const distance_m = view.getUint32(offset + 5, true);  // little-endian
            const net_power_gain_w = view.getInt32(offset + 9, true); // signed, little-endian
            offset += 13;

            records.push({
            timestamp,
            battery_percent,
            distance_m,
            net_power_gain_w,
            });
        }

        return { pageIndex, totalPages, recordCount, records };
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

                        // empty log case
                        if (totalPages === 0) {
                            console.log('No new telemetry data');
                            subscription.remove();
                            resolve();
                            return;
                        }

                        // append this page's records
                        allRecords.push(...records);
                        console.log(`Received page ${pageIndex + 1}/${totalPages} (${recordCount} records)`);

                        // ACK every page
                        await writeControlCommand(device, 0x02);

                        // if last page, POST to backend then clear logs
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

                            if (!response.ok) {
                                throw new Error(`Backend error: ${response.status}`);
                            }

                            await writeControlCommand(device, 0x03);
                            console.log('Telemetry sync complete, logs cleared');
                            subscription.remove();
                            resolve({ success: true, recordCount: allRecords.length });
                        }
                    } 
                    catch (err) {
                        subscription.remove();
                        reject(err);
                    }
                }
            );

            // subscribe is set up, now trigger the ESP to start sending
            writeControlCommand(device, 0x01).catch(reject);
        });
    }

  return {
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
    writeWeather
  };
}