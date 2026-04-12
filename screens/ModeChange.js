import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MAX_DIST, localStyles, joystickStyles } from "../components/ModeChangeStyles";
import { useBLE } from "../BLEcontext";

const Mode = Object.freeze({
  STATIONARY: "stationary",
  AUTOMATIC: "automatic",
  MANUAL: "manual",
});

function Joystick({ axis, onMove, onStop, label }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const touchId = useRef(null);
  const originY = useRef(0);
  const originX = useRef(0);

  const handleTouchStart = (e) => {
    const touch = e.nativeEvent.changedTouches[0];
    touchId.current = touch.identifier;
    originX.current = touch.pageX;
    originY.current = touch.pageY;
  };

  const handleTouchMove = (e) => {
    const touch = Array.from(e.nativeEvent.changedTouches).find(
      (t) => t.identifier === touchId.current,
    );
    if (!touch) return;

    if (axis === "x") {
      const dx = touch.pageX - originX.current;
      const clamped = Math.max(-MAX_DIST, Math.min(MAX_DIST, dx));
      pan.setValue({ x: clamped, y: 0 });
      onMove?.(parseFloat((clamped / MAX_DIST).toFixed(2)));
    } else {
      const dy = touch.pageY - originY.current;
      const clamped = Math.max(-MAX_DIST, Math.min(MAX_DIST, dy));
      pan.setValue({ x: 0, y: clamped });
      onMove?.(parseFloat((-clamped / MAX_DIST).toFixed(2)));
    }
  };

  const handleTouchEnd = (e) => {
    const released = Array.from(e.nativeEvent.changedTouches).find(
      (t) => t.identifier === touchId.current,
    );
    if (!released) return;
    touchId.current = null;
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    onStop?.();
  };

  return (
    <View style={localStyles.joystickWrapper}>
      <View
        style={joystickStyles.base}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {axis === "x" ? (
          <View style={joystickStyles.guideH} />
        ) : (
          <View style={joystickStyles.guideV} />
        )}
        <Animated.View
          style={[
            joystickStyles.knob,
            { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
          ]}
        />
      </View>
      <Text style={localStyles.joystickLabel}>{label}</Text>
    </View>
  );
}

export default function ModeChange() {
  const [mode, setMode] = useState(Mode.AUTOMATIC);
  const [joystickMounted, setJoystickMounted] = useState(false);
  const [throttle, setThrottle] = useState(0);
  const [steering, setSteering] = useState(0);
  const joystickAnim = useRef(new Animated.Value(0)).current;
  const isFirstMount = useRef(true);

  const { connectedDevice, isConnected, readMode, writeMode, writeManualControl } = useBLE();

  // on mount, read current mode from device
  useEffect(() => {
    async function fetchMode() {
      if (isConnected && connectedDevice) {
        const currentMode = await readMode(connectedDevice);
        if (currentMode) setMode(currentMode);
      }
    }
    fetchMode();
  }, []);

  // when mode changes, write to device — skip on first mount since we just read it
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (isConnected && connectedDevice) {
      writeMode(connectedDevice, mode);
    }
  }, [mode]);

  // when throttle or steering changes, send to device
  useEffect(() => {
    if (isConnected && connectedDevice && mode === Mode.MANUAL) {
      writeManualControl(connectedDevice, throttle, steering);
    }
  }, [throttle, steering]);

  // mount/unmount joystick section
  useEffect(() => {
    if (mode === Mode.MANUAL) {
      setJoystickMounted(true);
    } else {
      Animated.timing(joystickAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setJoystickMounted(false);
        setThrottle(0);
        setSteering(0);
      });
    }
  }, [mode]);

  // animate in after joystick is mounted
  useEffect(() => {
    if (joystickMounted) {
      joystickAnim.setValue(0);
      Animated.timing(joystickAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [joystickMounted]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View
        style={[
          { flex: 1, alignItems: "center" },
          !joystickMounted && { justifyContent: "center" },
        ]}
      >
        <View style={localStyles.topSection}>
          <View style={localStyles.buttonRow}>
            {Object.values(Mode).map((m) => {
              const selected = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    localStyles.modeButton,
                    selected && localStyles.modeButtonSelected,
                  ]}
                  onPress={() => setMode(m)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      localStyles.modeButtonText,
                      selected && localStyles.modeButtonTextSelected,
                    ]}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {joystickMounted && (
          <Animated.View
            style={[
              localStyles.joystickSection,
              {
                opacity: joystickAnim,
                transform: [
                  {
                    translateY: joystickAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={localStyles.joystickRow}>
              <Joystick
                axis="y"
                label={`Throttle: ${throttle.toFixed(2)}`}
                onMove={(val) => setThrottle(val)}
                onStop={() => setThrottle(0)}
              />
              <Joystick
                axis="x"
                label={`Steering: ${steering.toFixed(2)}`}
                onMove={(val) => setSteering(val)}
                onStop={() => setSteering(0)}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}