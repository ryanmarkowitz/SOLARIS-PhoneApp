import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";

import DistanceTraveledStyles from "./DistanceTraveledStyles.js";

const getDistFontSize = (value) => {
  if (value == null) return 38;
  if (value < 1000) return 38;
  if (value < 10000) return 32;
  if (value < 100000) return 26;
  return 20;
};

export default function DistanceTraveledPage2({ pastDayDist }) {
  const pastDayDistString = `${pastDayDist != null ? pastDayDist.toFixed(1) : "--"}m`;

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={DistanceTraveledStyles.title_container}>
        <Text style={DistanceTraveledStyles.title}>Distance Traveled</Text>
      </View>
      <View style={DistanceTraveledStyles.center_container}>
        <Text style={DistanceTraveledStyles.muted}>PAST DAY</Text>
        <Text style={[DistanceTraveledStyles.text, { fontSize: getDistFontSize(pastDayDist) }]}>{pastDayDistString}</Text>
      </View>
    </View>
  );
}
