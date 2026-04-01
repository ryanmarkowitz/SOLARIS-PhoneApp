import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";

import NetPowerStyles from "./NetPowerStyles.js";

const getDistFontSize = (value) => {
  if (value == null) return 60;
  if (value < 1000) return 60;
  if (value < 10000) return 48;
  if (value < 100000) return 36;
  return 28;
};

export default function NetPowerPage1({ currentPower }) {
  const currentPowerString = `${currentPower ?? "--"}W`;

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={NetPowerStyles.title_container}>
        <Text style={NetPowerStyles.title}>Net Power</Text>
      </View>
      <View style={NetPowerStyles.center_container}>
        <Text style={NetPowerStyles.muted}>CURRENT</Text>
        <Text
          style={[
            NetPowerStyles.text,
            { fontSize: getDistFontSize(currentPower) },
          ]}
        >
          {currentPowerString}
        </Text>
      </View>
    </View>
  );
}
