import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";

import BatteryLevelStyles from "./BatteryLevelStyles";

export default function BatteryLevelPage1({ CurBatteryLevel }) {
  const CurBatteryString = `${CurBatteryLevel ?? "--"}%`;

  const getBatteryColor = () => {
    if (CurBatteryLevel >= 90) return colors.green;
    if (CurBatteryLevel >= 21) return colors.text;
    return colors.red;
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={BatteryLevelStyles.title_container}>
        <Text style={BatteryLevelStyles.title}>Battery Level</Text>
      </View>
      <View style={BatteryLevelStyles.center_container}>
        <Text style={BatteryLevelStyles.muted}>CHARGE</Text>
        <View
          style={{
            marginTop: 5,
            width: "80%",
            height: 8,
            backgroundColor: colors.muted,
            borderRadius: 4,
          }}
        >
          <View
            style={{
              width: `${CurBatteryLevel ?? 0}%`,
              height: 8,
              backgroundColor: getBatteryColor(),
              borderRadius: 4,
            }}
          />
        </View>
        <Text style={[BatteryLevelStyles.text, { color: getBatteryColor() }]}>
          {CurBatteryString}
        </Text>
      </View>
    </View>
  );
}
