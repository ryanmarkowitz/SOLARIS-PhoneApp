import { StyleSheet } from "react-native";
import { colors } from "../Styles";

const signUpModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "95%",
    backgroundColor: colors.surface,
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    width: "80%",
    color: colors.muted,
    fontWeight: "100",
    fontFamily: "Geist",
    marginTop: 5,
  },
  title: {
    fontFamily: "Geist",
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
    marginTop: 5,
    marginBottom: 0,
  },
  textVerify: {
    color: colors.text,
    fontFamily: "Geist",
    fontWeight: "400",
    fontSize: 20,
  },
  textVerifyDisabled: {
    color: "#E8E8E8",
    fontFamily: "Geist",
    fontWeight: "400",
    fontSize: 20,
    opacity: 0.6,
  },
  textMuted: {
    fontFamily: "Geist",
    color: colors.muted,
    fontWeight: "400",
    fontSize: 12,
    marginTop: 10,
  },
  emailText: {
    fontFamily: "Geist",
    color: colors.highlight,
    fontWeight: "600",
    fontSize: 12,
    marginTop: 5,
  },
  textAccent: {
    fontFamily: "Geist",
    color: colors.accent2,
    fontWeight: "400",
    fontSize: 12,
    marginTop: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "10",
    width: "80%",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: colors.blue,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.6,
  },
  resendView: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 0,
  },
});

export default signUpModalStyles;
