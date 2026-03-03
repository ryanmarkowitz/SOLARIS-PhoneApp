import { useEffect } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import styles, { colors } from '../components/Styles.js';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAuth } from '@clerk/clerk-expo'

const LogInButtons = ({ text, button_color, text_color, style, navigation }) => {
  const {isSignedIn} = useAuth()

  // Detects if user is already signed in. If they are send them to signed in page
    useEffect(() => {
      if(isSignedIn){
        navigation.reset({
          index: 0,
          routes: [{ name: 'signed in' }],
        })
      }
    },[isSignedIn])

  return (
    <TouchableOpacity
      onPress={() => text === "Log In" ? navigation.navigate('log in') : navigation.navigate('sign up')}
      style={{
        width: '100%',
        height: 54,
        backgroundColor: button_color,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 70,
        ...style,
      }}
      activeOpacity={0.85}
    >
      <Text style={{ color: text_color, fontSize: 16, fontWeight: '700' }}>{text}</Text>
    </TouchableOpacity>
  );
};

export default function HomePage({navigation}) {
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.25);

  useEffect(() => {
    glowScale.value = withRepeat(
      withTiming(1.08, {
        duration: 1800,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withTiming(0.1, {
        duration: 1800,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [glowOpacity, glowScale]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require('../assets/Home.png')}
        style={{ flex: 1, width: '100%' }}
        resizeMode="cover"
      />
      <View
        style={{
          ...styles.container,
          backgroundColor: 'transparent',
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'flex-start',
          paddingTop: '60%',
        }}
      >
        <View
          style={{
            width: '56%',
            maxWidth: 260,
            aspectRatio: 1.3,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                width: 170,
                height: 170,
                borderRadius: 85,
                backgroundColor: colors.accent,
                shadowColor: colors.highlight,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 28,
                elevation: 10,
              },
              animatedGlowStyle,
            ]}
          />
          <Image
            source={require('../assets/SOLARIS.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={{ width: '80%', position: 'absolute', flexDirection: 'column', top: '80%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
        <LogInButtons text="Log In" button_color={colors.accent} text_color={colors.bg} navigation={navigation} />
        <LogInButtons text="Sign Up" button_color={colors.blue} text_color="#fff" style={{ marginTop: 12 }} navigation={navigation} />
      </View>
    </View>
  );
}
