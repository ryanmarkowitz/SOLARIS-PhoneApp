import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";

import DistanceTraveledStyles from "./DistanceTraveledStyles.js";

const getDistFontSize = (value) => {
  if (value == null) return 60;
  if (value < 1000) return 60;
  if (value < 10000) return 48;
  if (value < 100000) return 36;
  return 28;
};

export default function DistanceTraveledPage1({ pastHourDist }) {
  const pastHourDistString = `${pastHourDist ?? "--"}m`;

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={DistanceTraveledStyles.title_container}>
        <Text style={DistanceTraveledStyles.title}>Distance Traveled</Text>
      </View>
      <View style={DistanceTraveledStyles.center_container}>
        <Text style={DistanceTraveledStyles.muted}>PAST HOUR</Text>
        <Text style={[DistanceTraveledStyles.text, { fontSize: getDistFontSize(pastHourDist) }]}>{pastHourDistString}</Text>
      </View>
    </View>
  );
}
