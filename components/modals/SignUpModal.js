import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import signUpModalStyles from "./SignUpModalStyles";

export default function SignUpModal({
  navigation,
  signUp,
  setActive,
  visible,
  emailAddress,
}) {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef(null);

  const handleResend = () => {
    if (cooldown > 0) return;

    try {
      setCooldown(120);
      intervalRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const message =
        err?.errors?.[0]?.message || "Verification failed. Please try again.";
      Alert.alert("Verification failed", message);
    }
  };

  const handleVerify = async () => {
    console.log(code);
    try {
      await signUp.attemptEmailAddressVerification({ code });

      if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: "signed in" }] });
      }
    } catch (err) {
      const message =
        err?.errors?.[0]?.message || "Verification failed. Please try again.";
      Alert.alert("Verification failed", message);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      presentationStyle="overFullScreen"
    >
      <View style={signUpModalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%", alignItems: "center" }}
        >
          <View style={signUpModalStyles.card}>
            <Text style={signUpModalStyles.title}>Enter verification</Text>
            <Text style={signUpModalStyles.title}>code sent to:</Text>
            <Text
              style={signUpModalStyles.emailText}
            >{`\"${emailAddress}\"`}</Text>
            <TextInput
              onChangeText={setCode}
              value={code}
              style={signUpModalStyles.textInput}
              maxLength={6}
              textAlign="center"
            />
            <TouchableOpacity
              disabled={code.length !== 6}
              onPress={handleVerify}
              style={[
                signUpModalStyles.button,
                code.length !== 6 && signUpModalStyles.buttonDisabled,
              ]}
            >
              <Text
                style={[
                  signUpModalStyles.textVerify,
                  code.length !== 6 && signUpModalStyles.textVerifyDisabled,
                ]}
              >
                Verify Code
              </Text>
            </TouchableOpacity>
            <View style={signUpModalStyles.resendView}>
              <Text style={signUpModalStyles.textMuted}>
                Didn't recieve a code?{" "}
              </Text>
              <TouchableOpacity disabled={cooldown > 0} onPress={handleResend}>
                <Text
                  style={[
                    signUpModalStyles.textAccent,
                    cooldown > 0 && signUpModalStyles.textMuted,
                  ]}
                >
                  {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
