import { StatusBar } from 'expo-status-bar';
import styles from './components/Styles.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './screens/HomePage.js';
import LogIn from './screens/LogIn.js'
import SignUp from './screens/SignUp.js'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name = "home" component={HomePage} />
          <Stack.Screen name="log in" component={LogIn} />
          <Stack.Screen name="sign up" component={SignUp} />
        </Stack.Navigator>
        <StatusBar style="auto" />
    </NavigationContainer>
  );
}
