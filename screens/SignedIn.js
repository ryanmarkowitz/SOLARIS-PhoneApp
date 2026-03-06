import React, { use } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";

import config from "../../config"

import Footer from "../components/footer/Footer";
// sign out modal I may implement later so leaving logic in here for now
export default function SignedIn({navigation, screenSelection, setScreenSelection, signOutModalVisibility, setSignOutModalVisibility}) {
  const [data, setData] = useState(undefined)
  const {getToken} = useAuth() 

  const getAPIData = () => {
    const url = `${config.apiUrl}/telemetry`
    const token = getToken()
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>  
        <Text style={{ fontSize: 24, }}>You are signed in</Text>
      </View>
      <Footer 
        navigation = {navigation}
        screenSelection = {screenSelection}
        setScreenSelection={setScreenSelection}
        setSignOutModalVisibility={setSignOutModalVisibility}
      />
    </SafeAreaView>
  );
}
