import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";

import CpuTempStyles from "./CpuTempStyles";

export default function CpuTempPage1({ curCpuTemp }) {
  const curCpuTempString = `${curCpuTemp ?? "--"}°C`;

  const getCpuColor = () => {
    if (curCpuTemp <= 80) return colors.text;
    return colors.red;
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={CpuTempStyles.title_container}>
        <Text style={CpuTempStyles.title}>CPU TEMP</Text>
      </View>
      <View style={CpuTempStyles.center_container}>
        <Text style={CpuTempStyles.muted}>TEMP</Text>
        <Text style={[CpuTempStyles.text, { color: getCpuColor() }]}>
          {curCpuTempString}
        </Text>
      </View>
    </View>
  );
}
