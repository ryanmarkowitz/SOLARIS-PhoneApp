import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";
import BatteryLevelStyles from "./BatteryLevelStyles";
import { BarChart } from "react-native-gifted-charts";

export default function BatteryLevelPage2({
  pastDayBattery,
  cardWidth,
  activeIndex,
}) {
  const barData = (pastDayBattery ?? []).map((item, i) => {
    const date = new Date(item.dateTime); // JS parses ISO 8601 UTC automatically

    const hours = date.getHours(); // already local time after parsing
    const suffix = hours >= 12 ? "PM" : "AM";

    return {
      value: item.value,
      label: i % 1 == 0 ? (hours % 12 || 12) + suffix : "",
    };
  });

  const chartWidth = cardWidth * 0.75;

  const isActive = activeIndex === 1;

  const getBarWidth = (length) => Math.floor((chartWidth / length) * 0.8);
  const getSpacing = (length) => Math.floor((chartWidth / length) * 0.2);

  // dynamically find best xAxis label font size depending on how many records we got
  const getXAxisFontSize = (length) => {
    if (length >= 23) return 1;
    if (length >= 19) return 2;
    if (length >= 11) return 3;
    if (length >= 10) return 4;
    if (length >= 8) return 5;
    if (length >= 7) return 6;
    if (length >= 5) return 7;
    return 8;
  };

  if (!cardWidth || barData.length === 0) {
    return (
      <View style={{ flex: 1, width: "100%" }}>
        <View style={BatteryLevelStyles.title_container}>
          <Text style={BatteryLevelStyles.title}>Battery Level</Text>
        </View>
        <View style={BatteryLevelStyles.center_container}>
          <Text style={BatteryLevelStyles.muted}>PAST DAY</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={BatteryLevelStyles.title_container}>
        <Text style={BatteryLevelStyles.title}>Battery Level</Text>
      </View>
      {isActive && (
        <View style={BatteryLevelStyles.center_container}>
          <Text style={BatteryLevelStyles.muted}>PAST DAY</Text>
          <BarChart
            key={activeIndex === 1 ? `visible-${activeIndex}` : "hidden"}
            data={barData}
            barWidth={getBarWidth(barData.length)}
            spacing={getSpacing(barData.length)}
            initialSpacing={0}
            endSpacing={0}
            cappedBars
            capThickness={4}
            showGradient
            yAxisLabelSuffix="%"
            isAnimated
            backgroundColor={colors.surface2}
            gradientColor={colors.surface}
            frontColor={colors.blue}
            maxValue={100}
            stepValue={20}
            height={100}
            hideRules
            xAxisLabelTextStyle={{
              color: colors.text,
              fontSize: getXAxisFontSize(barData.length),
            }}
            yAxisTextStyle={{ color: colors.text, fontSize: 7 }}
            xAxisColor={colors.border}
            yAxisColor={colors.border}
            disablePress
            animationDuration={1200}
          />
        </View>
      )}
    </View>
  );
}
