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

const Mode = Object.freeze({
  STATIONARY: "stationary",
  AUTOMATIC: "automatic",
  MANUAL: "manual",
});

// axis="x" locks to horizontal (steering), axis="y" locks to vertical (throttle)
// onMove receives a single value in [-1, 1]
//   axis="y": -1 = full reverse, 1 = full forward
//   axis="x": -1 = full left,    1 = full right
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
      onMove?.(parseFloat((-clamped / MAX_DIST).toFixed(2))); // invert: up = positive
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
  const [throttle, setThrottle] = useState(0); // -1 to 1, forward/backward
  const [steering, setSteering] = useState(0); // -1 to 1, left/right
  const joystickAnim = useRef(new Animated.Value(0)).current; // 0=hidden, 1=visible

  // Mount/unmount the joystick section
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

  // Animate in after joystick is mounted in the tree
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

  // TODO: On mount, query BLE device for current mode and call setMode() with the result
  useEffect(() => {}, []);

  // TODO: When mode changes, send new mode to BLE device
  useEffect(() => {}, [mode]);

  // TODO: When throttle or steering changes, send to BLE device
  useEffect(() => {}, [throttle, steering]);

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
