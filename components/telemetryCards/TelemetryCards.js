import React, { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import TelemetryCardsStyles from "./TelemetryCardsStyles.js";

export default function TelemetryCards({ children }) {
  const pages = React.Children.toArray(children).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const handleMomentumEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  };

  return (
    <View
      style={TelemetryCardsStyles.card}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width - 6)}
    >
      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        showsHorizontalScrollIndicator={false}
        style={{ width: cardWidth }} // ScrollView knows its width
      >
        {pages.map((child, i) => (
          <View key={i} style={{ width: cardWidth }}>
            {React.cloneElement(child, { cardWidth, activeIndex })}
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {pages.map((_, i) => (
          <View
            key={i}
            style={[
              TelemetryCardsStyles.dot,
              activeIndex === i && TelemetryCardsStyles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
