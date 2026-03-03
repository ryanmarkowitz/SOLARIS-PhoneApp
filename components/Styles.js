import { StyleSheet } from "react-native";

// Theme tokens mapped from your CSS variables.
export const colors = {
  bg: "#070a0f",
  surface: "#0e1320",
  surface2: "#121a2b",
  border: "#1f2a3a",
  text: "#f6e7c3",
  muted: "#a7b0c2",
  accent: "#f59e0b",
  accent2: "#ea580c",
  highlight: "#fcd34d",
  blue: "#2563eb",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  surface2: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: 'Geist'
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
  },
  link: {
    color: colors.accent,
  },
  linkHover: {
    color: colors.highlight,
  },
  accent: {
    color: colors.accent,
  },
  accent2: {
    color: colors.accent2,
  },
  highlight: {
    color: colors.highlight,
  },
  blue: {
    color: colors.blue,
  },
  border: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  dropshadow: {
    width: "50%",
    height: "50%",
    position: "absolute",
    top: "0",
    alignSelf: "center",

    // ios
    shadowColor: '#fcd34d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: .75,
    shadowRadius: 45,

    // Android Shadow
    elevation: 10,
  },
});

export default styles;
