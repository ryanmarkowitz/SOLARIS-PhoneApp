import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

import { FontAwesome } from "@expo/vector-icons";

import FooterStyles from "./FooterStyles";

import {colors} from "../Styles";

export default function Footer({ navigation, screenSelection, setScreenSelection, setSignOutModalVisibility }) {
  const { signOut } = useAuth();
  const { user } = useUser()

  const handleLogout = async () => {
    setSignOutModalVisibility(true)
    setScreenSelection(3)
    try{
      await signOut();
    }
    catch(err){
      const message =
      err?.errors?.[0]?.message || "Sign-up failed. Please try again.";
      Alert.alert("Sign-up failed", message);
      return;
    }
    navigation.replace("home");
  };


  return (
    <View style={FooterStyles.container}>
        <View style={{justifyContent: "center", alignItems: "center"}}>
          <Pressable onPress={() => setScreenSelection(1)} style={{justifyContent: "center", alignItems: "center"}}>
            <FontAwesome name="database" size={25} color={screenSelection === 1 ? colors.accent : colors.text} style={{ marginBottom: 5 }}/>
            <Text style={[FooterStyles.text, (screenSelection === 1) && FooterStyles.accentText]}>Telemetry</Text>
          </Pressable>
        </View>
        <Pressable onPress={()=> setScreenSelection(2)} style={{justifyContent: "center", alignItems: "center"}}>
          <View style={{justifyContent: "center", alignItems: "center"}}>
            <FontAwesome name="gears" size={25} color={screenSelection === 2 ? colors.accent : colors.text} style={{ marginBottom: 5 }}/>
            <Text style={[FooterStyles.text, (screenSelection === 2) && FooterStyles.accentText]}>Mode</Text>
          </View>
        </Pressable>
        <View style={{justifyContent: "center", alignItems: "center"}}>
          <Pressable onPress={handleLogout} style={{justifyContent: "center", alignItems: "center"}}>
              <FontAwesome name="sign-out" size={25} color={screenSelection === 3 ? colors.accent : colors.text} style={{ marginBottom: 5 }}/>
              <Text style={[FooterStyles.text, (screenSelection === 3) && FooterStyles.accentText]}>Sign out</Text>
          </Pressable>
        </View>
    </View>
  );
}
