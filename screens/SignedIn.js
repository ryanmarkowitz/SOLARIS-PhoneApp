import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";

import Footer from "../components/footer/Footer";

export default function SignedIn({navigation, screenSelection, setScreenSelection, signOutModalVisibility, setSignOutModalVisibility}) {
  React.useEffect(()=>{
    console.log(signOutModalVisibility)
  }, [signOutModalVisibility])

  const { signOut } = useAuth();

  const handleLogout = async () => {
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
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>  
        <Text style={{ fontSize: 24, }}>You are signed in</Text>

        <Pressable
          onPress={handleLogout}
          style={{ margin: 20, padding: 12, borderWidth: 1 }}
        >
          <Text>Sign Out</Text>
        </Pressable>
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
