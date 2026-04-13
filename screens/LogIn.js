import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

import { FontAwesome } from "@expo/vector-icons";

import { useAuth, useSignIn, useSSO } from "@clerk/clerk-expo";

import styles, { colors } from "../components/Styles";

export default function LogIn({ navigation }) {
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, onChangeEmail] = useState("");
  const [password, onChangePassword] = useState("");
  const [viewPassword, setViewPassword] = useState(true);

  // Detects if user is already signed in. If they are send them to signed in page
  useEffect(() => {
    if (isSignedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: "bluetooth" }],
      });
    }
  }, [isSignedIn]);

  // Handles pressing the google button for sign in
  const onGooglePress = async () => {
    console.log("pressed");
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: "oauth_google",
    });

    if (createdSessionId) {
      await setActive({ session: createdSessionId });
      navigation.replace("signed in");
    }
  };

  // Handles facebook button for sign in
  const onFacebookPress = async () => {
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: "oauth_facebook",
    });

    if (createdSessionId) {
      await setActive({ session: createdSessionId });
      navigation.replace("signed in");
    }
  };

  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      // If sign-in is complete, activate the session
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        navigation.replace("signed in");
        return;
      }

      // If not complete, it may require extra steps (2FA, etc.)
      Alert.alert("Sign-in incomplete", "Additional verification is required.");
    } catch (err) {
      // Clerk errors usually have a readable message in `errors[0].message`
      const message =
        err?.errors?.[0]?.message ||
        "Email or password was invalid. Please try again.";

      Alert.alert("Sign-in failed", message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0} // adjust later if needed
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.bg,
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface2,
              width: "90%",
              borderRadius: 50,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 20,
                fontWeight: "800",
                fontFamily: "Geist",
                marginTop: 25,
                padding: 2,
              }}
            >
              Sign into SOLARIS
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: 14,
                fontFamily: "Geist",
                fontWeight: "200",
              }}
            >
              Welcome back! Please sign in to continue
            </Text>
            <TouchableOpacity
              onPress={onGooglePress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "10",
                width: "80%",
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 10,
                backgroundColor: "#fff",
              }}
              activeOpacity={0.85}
            >
              <FontAwesome name="google" size={35} color="#DB4437" />
              <Text
                style={{
                  fontFamily: "Geist",
                  color: colors.muted,
                  fontWeight: "300",
                }}
              >
                Continue with google
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onFacebookPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "10",
                width: "80%",
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 12,
                backgroundColor: "#3b579d",
              }}
              activeOpacity={0.85}
            >
              <FontAwesome name="facebook" size={35} color="#fff" />
              <Text
                style={{
                  fontFamily: "Geist",
                  color: colors.muted,
                  fontWeight: "300",
                }}
              >
                Continue with facebook
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                width: "80%",
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
              <Text
                style={{ marginHorizontal: 10, color: "#888", fontSize: 14 }}
              >
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                alignSelf: "flex-start",
                marginLeft: "10%",
                fontFamily: "Geist",
                fontWeight: "800",
                marginTop: 20,
              }}
            >
              Email address
            </Text>
            <TextInput
              onChangeText={onChangeEmail}
              value={email}
              style={{
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 10,
                padding: 15,
                width: "80%",
                color: colors.muted,
                fontWeight: "100",
                fontFamily: "Geist",
                marginTop: 5,
              }}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                alignSelf: "flex-start",
                marginLeft: "10%",
                fontFamily: "Geist",
                fontWeight: "800",
                marginTop: 10,
              }}
            >
              Password
            </Text>
            <View style={{ width: "80%", marginTop: 5 }}>
              <View style={{ position: "relative", justifyContent: "center" }}>
                <TextInput
                  onChangeText={onChangePassword}
                  value={password}
                  secureTextEntry={viewPassword}
                  style={{
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 15,
                    paddingRight: 45, // space for icon
                    color: colors.muted,
                    fontWeight: "100",
                    fontFamily: "Geist",
                  }}
                />

                <TouchableOpacity
                  onPress={() => setViewPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: 15,
                  }}
                >
                  <FontAwesome
                    name={viewPassword ? "eye-slash" : "eye"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={onSignInPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "10",
                width: "80%",
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 20,
                backgroundColor: colors.blue,
              }}
            >
              <Text
                style={{
                  fontFamily: "Geist",
                  color: colors.text,
                  fontWeight: "800",
                  fontSize: 16,
                }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
            <View
              style={{
                aligntItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                marginTop: 20,
                width: "80%",
                flexDirection: "row",
                gap: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: "Geist",
                  color: colors.muted,
                  fontWeight: "400",
                  fontSize: 12,
                }}
              >
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("sign up")}>
                <Text
                  style={{
                    fontFamily: "Geist",
                    color: colors.accent2,
                    fontWeight: "400",
                    fontSize: 12,
                  }}
                >
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
