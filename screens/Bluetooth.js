import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../components/Styles";
import { FontAwesome } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useAuth } from '@clerk/clerk-expo';
import config from "../config";
import { useBLE } from "../BLEcontext";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withDelay,
  withSequence,
  cancelAnimation,
  withTiming,
} from "react-native-reanimated";

const RING_DURATION = 1800;
const RING_STAGGER = 600;
const PAUSE = 600;

export default function Bluetooth({ navigation }) {
  const [title, setTitle] = useState("Connecting to Bluetooth Device");
  const [titleColor, setTitleColor] = useState(colors.text);
  const [showRetry, setShowRetry] = useState(false);

  const { getToken } = useAuth();
  const {
    isConnected,
    requestPermissions,
    scanForRobot,
    connectToRobot,
    syncTime,
    writeWeather,
    syncTelemetry,
  } = useBLE();

  // Animation values
  const ringScale1 = useSharedValue(1);
  const ringOpacity1 = useSharedValue(0.9);
  const ringScale2 = useSharedValue(1);
  const ringOpacity2 = useSharedValue(0.93);
  const ringScale3 = useSharedValue(1);
  const ringOpacity3 = useSharedValue(0.95);

  const onBleNotWantedPress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "signed in" }],
    });
  };

  const pulse = (scaleVal, opacityVal, delay) => {
    scaleVal.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.8, { duration: RING_DURATION, easing: Easing.out(Easing.sin) }),
        withTiming(1.0, { duration: 0 }),
        withDelay(PAUSE, withTiming(1.0, { duration: 0 })),
      ),
      -1,
    ));
    opacityVal.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0.0, { duration: RING_DURATION, easing: Easing.out(Easing.sin) }),
        withTiming(0.9, { duration: 0 }),
        withDelay(PAUSE, withTiming(0.9, { duration: 0 })),
      ),
      -1,
    ));
  };

  const startAnimations = () => {
    ringScale1.value = 1;    ringOpacity1.value = 0.9;
    ringScale2.value = 1;    ringOpacity2.value = 0.87;
    ringScale3.value = 1;    ringOpacity3.value = 0.85;

    pulse(ringScale1, ringOpacity1, 0);
    pulse(ringScale2, ringOpacity2, RING_STAGGER);
    pulse(ringScale3, ringOpacity3, RING_STAGGER * 2);
  };

  const setError = (message) => {
    setTitle(message);
    setTitleColor('red');
    setShowRetry(true);
  };

  const connectAndSync = async () => {
    setTitle("Connecting to Bluetooth Device");
    setTitleColor(colors.text);
    setShowRetry(false);
    startAnimations();

    try {
      // step 1: request BLE + location permissions
      const bleGranted = await requestPermissions();
      if (!bleGranted) {
        setError("Bluetooth permissions denied");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError("Location permissions denied");
        return;
      }

      // step 2: scan and connect
      scanForRobot(async (device) => {
        const connected = await connectToRobot(device);
        if (!connected) {
          setError("Failed to connect to robot");
          return;
        }

        console.log("passed step 2");

        // step 3: update title and begin syncing
        setTitle("Connected to Device: Syncing Data");

        // step 4: sync time
        await syncTime(connected);

        // step 5: fetch weather and write to ESP
        const token = await getToken();
        const location = await Location.getCurrentPositionAsync({});
        console.log("location found");
        const { latitude, longitude } = location.coords;

        const weatherResponse = await fetch(
          `${config.apiUrl}/weather?lat=${latitude}&long=${longitude}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("backend api was called and returned");

        if (!weatherResponse.ok) {
          setError("Failed to fetch weather data");
          return;
        }

        const weatherData = await weatherResponse.json();
        await writeWeather(connected, weatherData);

        // step 6: sync telemetry
        await syncTelemetry(connected);

        // step 7: navigate to signed in screen
        navigation.reset({
          index: 0,
          routes: [{ name: "signed in" }],
        });
      });

    } catch (err) {
      console.error('Connection flow error:', err);
      setError("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    connectAndSync();

    return () => {
      cancelAnimation(ringScale1);  cancelAnimation(ringOpacity1);
      cancelAnimation(ringScale2);  cancelAnimation(ringOpacity2);
      cancelAnimation(ringScale3);  cancelAnimation(ringOpacity3);
    };
  }, []);

  const ring1Style = useAnimatedStyle(() => ({ transform: [{ scale: ringScale1.value }], opacity: ringOpacity1.value }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ scale: ringScale2.value }], opacity: ringOpacity2.value }));
  const ring3Style = useAnimatedStyle(() => ({ transform: [{ scale: ringScale3.value }], opacity: ringOpacity3.value }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: titleColor, fontSize: 20, fontWeight: "700", fontFamily: 'Geist', marginBottom: 160 }}>
        {title}
      </Text>

      <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
        {[ring1Style, ring2Style, ring3Style].map((curStyle, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.blue }, curStyle]}
          />
        ))}
        <View style={{ backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', borderRadius: 100, width: 200, height: 200 }}>
          <FontAwesome name="bluetooth-b" size={45} color={colors.text} />
        </View>
      </View>

      {showRetry && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={connectAndSync}
          style={{
            backgroundColor: colors.blue,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 10,
            paddingHorizontal: 50,
            borderRadius: 10,
            marginTop: 40,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "600", fontFamily: 'Geist' }}>Retry</Text>
        </TouchableOpacity>
      )}

      {(!isConnected || showRetry) && (<TouchableOpacity
        activeOpacity={0.85}
        onPress={onBleNotWantedPress}
        style={{
          backgroundColor: colors.accent,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 10,
          paddingHorizontal: 50,
          borderRadius: 10,
          marginTop: 120,
        }}
      >
        <Text style={{ color: colors.bg, fontWeight: "600", fontFamily: 'Geist' }}>Continue without bluetooth</Text>
      </TouchableOpacity>)}
    </View>
  );
}