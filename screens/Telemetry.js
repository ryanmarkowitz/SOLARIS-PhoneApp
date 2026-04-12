import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles, { colors } from "../components/Styles";
import { useAuth } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";
import * as Location from 'expo-location';

import config from "../config";
import TelemetryCards from "../components/telemetryCards/TelemetryCards";
import { useBLE } from "../BLEcontext";

import BatteryLevelPage1 from "../components/batteryLevel/BatteryLevelPage1";
import BatteryLevelPage2 from "../components/batteryLevel/BatteryLevelPage2";

import DistanceTraveledPage1 from "../components/distanceTraveled/DistanceTraveledPage1";
import DistanceTraveledPage2 from "../components/distanceTraveled/DistanceTraveledPage2";
import DistanceTraveledPage3 from "../components/distanceTraveled/DistanceTraveledPage3";
import DistanceTraveledPage4 from "../components/distanceTraveled/DistanceTraveledPage4";
import DistanceTraveledPage5 from "../components/distanceTraveled/DistanceTraveledPage5";

import NetPowerPage1 from "../components/netPower/NetPowerPage1";
import NetPowerPage2 from "../components/netPower/NetPowerPage2";
import NetPowerPage3 from "../components/netPower/NetPowerPage3";
import NetPowerPage4 from "../components/netPower/NetPowerPage4";

import CpuTempPage1 from "../components/cpuTemp/CpuTempPage1";
import CpuTempPage2 from "../components/cpuTemp/CpuTempPage2";
import CpuTempPage3 from "../components/cpuTemp/CpuTempPage3";

export default function Telemetry({ navigation }) {
  const [data, setData] = useState(undefined);
  const [ShowBatteryPage2, SetShowBatteryPage2] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const {
    isConnected,
    connectedDevice,
    syncTime,
    writeWeather,
    syncTelemetry,
  } = useBLE();

  const getAPIData = async () => {
    try {
      const url = `${config.apiUrl}/telemetry`;
      const token = await getToken();
      let result = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      result = await result.json();
      setData(result);
      SetShowBatteryPage2(true);
    } catch (err) {
      console.error("getAPIData failed:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const syncBLEData = async () => {
    try {
      const token = await getToken();
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      await syncTime(connectedDevice);

      const weatherResponse = await fetch(
        `${config.apiUrl}/weather?lat=${latitude}&long=${longitude}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!weatherResponse.ok) throw new Error('Weather fetch failed');

      const weatherData = await weatherResponse.json();
      await writeWeather(connectedDevice, weatherData);
      await syncTelemetry(connectedDevice);
    } catch (err) {
      console.error('BLE sync failed:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isConnected && connectedDevice) {
      await syncBLEData();
    }
    await getAPIData();
  };

  useEffect(() => {
    getAPIData();
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      {!isConnected && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('bluetooth')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
          }}
        >
          <FontAwesome name="arrow-left" size={16} color={colors.accent} />
          <Text style={{ color: colors.accent, fontFamily: 'Geist', fontWeight: '600' }}>
            Connect to SOLARIS
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={{ justifyContent: "flex-start", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../assets/SOLARIS_model1.png")}
            style={{
              width: "100%",
              height: "100%",
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 10,
            }}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 4, justifyContent: "space-evenly", alignItems: "center" }}>
          <View style={{ width: "100%", height: "50%", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <TelemetryCards>
              <BatteryLevelPage1 CurBatteryLevel={data?.batteryLevel?.current} />
              {ShowBatteryPage2 && (
                <BatteryLevelPage2 pastDayBattery={data?.batteryLevel?.pastDay} />
              )}
            </TelemetryCards>
            <TelemetryCards>
              <DistanceTraveledPage1 pastHourDist={data?.distanceTraveled?.pastHour} />
              <DistanceTraveledPage2 pastDayDist={data?.distanceTraveled?.pastDay} />
              <DistanceTraveledPage3 pastWeekDist={data?.distanceTraveled?.pastWeek} />
              <DistanceTraveledPage4 pastMonthDist={data?.distanceTraveled?.pastMonth} />
              <DistanceTraveledPage5 allTimeDist={data?.distanceTraveled?.allTime} />
            </TelemetryCards>
          </View>
          <View style={{ width: "100%", height: "50%", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <TelemetryCards>
              <NetPowerPage1 currentPower={data?.netPower?.current} />
              <NetPowerPage2 pastHourPower={data?.netPower?.pastHour} />
              <NetPowerPage3 pastDayPower={data?.netPower?.pastDay} />
              <NetPowerPage4 pastWeekPower={data?.netPower?.pastWeek} />
            </TelemetryCards>
            <TelemetryCards>
              <CpuTempPage1 curCpuTemp={data?.cpuTemp?.current} />
              <CpuTempPage2 pastHourCpuTemp={data?.cpuTemp?.pastHour} />
              <CpuTempPage3 pastDayCpuTemp={data?.cpuTemp?.pastDay} />
            </TelemetryCards>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}