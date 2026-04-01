import React from "react";
import { View, Text, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import FooterStyles from "./FooterStyles";
import { colors } from "../Styles";

export default function Footer({ state, navigation, onSignOut }) {
  const activeIndex = state.index;

  return (
    <View style={FooterStyles.container}>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Pressable onPress={() => navigation.navigate("Telemetry")} style={{ justifyContent: "center", alignItems: "center" }}>
          <FontAwesome name="database" size={25} color={activeIndex === 0 ? colors.accent : colors.text} style={{ marginBottom: 5 }} />
          <Text style={[FooterStyles.text, activeIndex === 0 && FooterStyles.accentText]}>Telemetry</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => navigation.navigate("Mode")} style={{ justifyContent: "center", alignItems: "center" }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <FontAwesome name="gears" size={25} color={activeIndex === 1 ? colors.accent : colors.text} style={{ marginBottom: 5 }} />
          <Text style={[FooterStyles.text, activeIndex === 1 && FooterStyles.accentText]}>Mode</Text>
        </View>
      </Pressable>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Pressable onPress={onSignOut} style={{ justifyContent: "center", alignItems: "center" }}>
          <FontAwesome name="sign-out" size={25} color={colors.text} style={{ marginBottom: 5 }} />
          <Text style={FooterStyles.text}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}
