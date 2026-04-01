import { StyleSheet } from "react-native";
import { colors } from "../Styles";

const NetPowerStyles = StyleSheet.create({
  title_container: {
    width: "100%",
    borderColor: colors.border,
    borderBottomWidth: 1,
    alignItems: "center",
    marginTop: 5,
  },
  center_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  title: {
    color: colors.accent,
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 20,
  },
  muted: {
    color: colors.muted,
    fontWeight: "medium",
    marginBottom: 10,
    fontSize: 11,
    letterSpacing: 2,
  },
  text: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 60,
  },
  green_text: {
    color: colors.green,
    fontWeight: "bold",
    fontSize: 60,
  },
  red_text: {
    color: colors.red,
    fontWeight: "bold",
    fontSize: 60,
  },
});

export default NetPowerStyles;
