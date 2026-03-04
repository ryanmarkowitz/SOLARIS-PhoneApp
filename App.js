import { StatusBar } from "expo-status-bar";
import styles from "./components/Styles.js";
import { SafeAreaView } from "react-native-safe-area-context";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import { useFonts } from "expo-font";

import HomePage from "./screens/HomePage.js";
import LogIn from "./screens/LogIn.js";
import SignUp from "./screens/SignUp.js";
import SignedIn from "./screens/SignedIn.js";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Geist: require("./assets/fonts/Geist.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home" component={HomePage} />
          <Stack.Screen name="log in" component={LogIn} />
          <Stack.Screen name="sign up" component={SignUp} />
          <Stack.Screen name="signed in" component={SignedIn} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ClerkProvider>
  );
}
