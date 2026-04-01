import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";
import NetPowerStyles from "./NetPowerStyles";
import { BarChart } from "react-native-gifted-charts";

export default function NetPowerPage2({
  pastHourPower,
  cardWidth,
  activeIndex,
}) {
  const barData = (pastHourPower ?? []).map((item, i) => {
    const date = new Date(item.dateTime); // JS parses ISO 8601 UTC automatically

    const hours = date.getHours(); // already local time after parsing
    const minutes = date.getMinutes();
    const minutesToString = minutes < 10 ? "0" + minutes : minutes;

    return {
      value: item.value,
      label: i % 1 == 0 ? (hours % 12 || 12) + ":" + minutesToString : "",
    };
  });

  const getMaxVal = () => {
    return Math.ceil(Math.max(...barData.map((item) => item.value)));
  };

  const getStepVal = () => {
    return Math.ceil(Math.max(...barData.map((item) => item.value)) / 5);
  };

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
        <View style={NetPowerStyles.title_container}>
          <Text style={NetPowerStyles.title}>Net Power</Text>
        </View>
        <View style={NetPowerStyles.center_container}>
          <Text style={NetPowerStyles.muted}>PAST HOUR</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={NetPowerStyles.title_container}>
        <Text style={NetPowerStyles.title}>Net Power</Text>
      </View>
      {isActive && (
        <View style={NetPowerStyles.center_container}>
          <Text style={NetPowerStyles.muted}>PAST HOUR</Text>
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
            yAxisLabelSuffix="W"
            isAnimated
            backgroundColor={colors.surface2}
            gradientColor={colors.surface}
            frontColor={colors.blue}
            maxValue={getMaxVal()}
            stepValue={getStepVal()}
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
            autoShiftLabels
          />
        </View>
      )}
    </View>
  );
}
