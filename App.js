import { StatusBar } from 'expo-status-bar';
import styles from './components/Styles.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomePage from './components/HomePage/HomePage.js';

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <HomePage />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
