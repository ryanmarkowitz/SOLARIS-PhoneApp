import React, {useEffect, useState} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../components/Styles";

import { FontAwesome } from "@expo/vector-icons";

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
  // temp useState for tracking BLE connection.
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [title, setTitle] = useState("Connecting to Bluetooth Device")

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
  }

  const pulse = (scaleVal, opacityVal, delay) => {
    scaleVal.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.8, { duration: RING_DURATION, easing: Easing.out(Easing.sin) }),
        withTiming(1.0, { duration: 0 }),           // snap back (ring is invisible, opacity=0)
        withDelay(PAUSE, withTiming(1.0, { duration: 0 })), // hold for pause duration
      ),
      -1,
    ));
    opacityVal.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0.0, { duration: RING_DURATION, easing: Easing.out(Easing.sin) }),
        withTiming(0.9, { duration: 0 }),           // reset opacity (ring is at scale=1, invisible for 1 frame)
        withDelay(PAUSE, withTiming(0.9, { duration: 0 })), // hold for pause duration
      ),
      -1,
    ));
  };
  
  useEffect(() => {

    pulse(ringScale1, ringOpacity1, 0);
    pulse(ringScale2, ringOpacity2, RING_STAGGER);
    pulse(ringScale3, ringOpacity3, RING_STAGGER * 2);
  },[ringOpacity1, ringOpacity2, ringOpacity3, ringScale1, ringScale2, ringScale3]);

  // on mount make sure to reset values for animation
  useEffect(() => {
    ringScale1.value = 1;    ringOpacity1.value = 0.9;
    ringScale2.value = 1;    ringOpacity2.value = 0.9;
    ringScale3.value = 1;    ringOpacity3.value = 0.9;

    pulse(ringScale1, ringOpacity1, 0);
    pulse(ringScale2, ringOpacity2, RING_STAGGER);
    pulse(ringScale3, ringOpacity3, RING_STAGGER * 2);

    return () => {
      cancelAnimation(ringScale1);  cancelAnimation(ringOpacity1);
      cancelAnimation(ringScale2);  cancelAnimation(ringOpacity2);
      cancelAnimation(ringScale3);  cancelAnimation(ringOpacity3);
   };
  }, []);


  const ring1Style = useAnimatedStyle(() => ({ transform: [{ scale: ringScale1.value }], opacity: ringOpacity1.value }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ scale: ringScale2.value }], opacity: ringOpacity2.value }));
  const ring3Style = useAnimatedStyle(() => ({ transform: [{ scale: ringScale3.value }], opacity: ringOpacity3.value }));

  // If bluetooth becomes connected we can move to sign in screen
  // TODO: add animation of bluetooth finishing connection before moving to next page
  useEffect(() => {
    if (isBleConnected) {
      navigation.reset({
        index: 0,
        routes: [{ name: "signed in" }],
      });
    }
  }, [isBleConnected]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{color: colors.text, fontSize: 20, fontWeight: "700", fontFamily: 'Geist', marginBottom: 160}}>{title}</Text>
  {/* Fixed-size container so text doesn't push the rings */}
  <View style={{width: 200, height: 200, alignItems: 'center', justifyContent: 'center'}}>
    {[ring1Style, ring2Style, ring3Style].map((curStyle, i) => (
      <Animated.View
        key={i}
        pointerEvents="none"
        style={[{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.blue }, curStyle]}
      />
    ))}
    <View style={{backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', borderRadius: 100, width: 200, height: 200}}>
      <FontAwesome name="bluetooth-b" size={45} color={colors.text} />
    </View>
  </View>
  <TouchableOpacity activeOpacity={.85} onPress={onBleNotWantedPress} style={{
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 160,
    flexDirection: 'row',
    alignItems: 'center',
  }}>
    <Text style={{color: colors.bg, fontWeight: "600", fontFamily: 'Geist'}}>Continue without bluetooth</Text>
  </TouchableOpacity>
</View>

  );
}