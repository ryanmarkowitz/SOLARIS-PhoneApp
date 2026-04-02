import React from "react";
import { View, Text } from "react-native";
import styles, { colors } from "../Styles";
import CpuTempStyles from "./CpuTempStyles";
import { BarChart } from "react-native-gifted-charts";

export default function CpuTempPage2({
  pastHourCpuTemp,
  cardWidth,
  activeIndex,
}) {
  const barData = (pastHourCpuTemp ?? []).map((item, i) => {
    const date = new Date(item.dateTime); // JS parses ISO 8601 UTC automatically

    const hours = date.getHours(); // already local time after parsing
    const minutes = date.getMinutes();
    const minutesToString = minutes < 10 ? "0" + minutes : minutes;

    return {
      value: item.value,
      label: i % 1 == 0 ? (hours % 12 || 12) + ":" + minutesToString : "",
    };
  });

  const getChartParams = () => {
    const TOTAL_HEIGHT = 120;
    const absMax = Math.max(
      0,
      Math.ceil(Math.max(...barData.map((i) => i.value))),
    );
    const absMin = Math.abs(
      Math.min(0, Math.floor(Math.min(...barData.map((i) => i.value)))),
    );
    const range = Math.max(absMax, absMin);
    const stepVal = Math.ceil(range / 5);
    const sectionsAbove = Math.max(1, Math.ceil(absMax / stepVal));
    const sectionsBelow = absMin > 0 ? Math.ceil(absMin / stepVal) : 0;
    const stepHeight = Math.floor(
      TOTAL_HEIGHT / (sectionsAbove + Math.max(1, sectionsBelow)),
    );
    return {
      maxValue: sectionsAbove * stepVal,
      mostNegativeValue: -(sectionsBelow * stepVal),
      stepValue: stepVal,
      noOfSections: sectionsAbove,
      noOfSectionsBelowXAxis: sectionsBelow,
      stepHeight,
      height: sectionsAbove * stepHeight,
    };
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
        <View style={CpuTempStyles.title_container}>
          <Text style={CpuTempStyles.title}>CPU Temp</Text>
        </View>
        <View style={CpuTempStyles.center_container}>
          <Text style={CpuTempStyles.muted}>PAST HOUR</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={CpuTempStyles.title_container}>
        <Text style={CpuTempStyles.title}>CPU Temp</Text>
      </View>
      {isActive && (
        <View style={CpuTempStyles.center_container}>
          <Text style={CpuTempStyles.muted}>PAST HOUR</Text>
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
            {...getChartParams()}
            hideRules
            xAxisLabelsHeight={barData.length >= 19 ? 0 : undefined}
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
