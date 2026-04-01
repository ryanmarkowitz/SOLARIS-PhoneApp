import React from "react";
import { useAuth } from "@clerk/clerk-expo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { colors } from "../components/Styles";
import Telemetry from "./Telemetry";
import ModeChange from "./ModeChange";
import Footer from "../components/footer/Footer";

const Tab = createBottomTabNavigator();

export default function SignedIn({ navigation }) {
  const { signOut, getToken } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      // sign out error is non-critical, proceed to home anyway
    }
    navigation.replace("home");
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <Footer {...props} onSignOut={handleSignOut} />}
      screenOptions={{
        headerShown: false,
        animation: "shift",
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tab.Screen name="Telemetry" component={Telemetry} />
      <Tab.Screen name="Mode" component={ModeChange} />
    </Tab.Navigator>
  );
}
