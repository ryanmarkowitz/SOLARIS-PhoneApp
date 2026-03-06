import { StyleSheet } from "react-native";
import { colors } from "../Styles";

const FooterStyles = StyleSheet.create({
  container: {
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    paddingVertical: 10,
    backgroundColor: colors.surface2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  text: {
    color: colors.text,
    fontFamily: "Geist",
    fontWeight: "400",
    fontSize: 12,
    marginBottom: 10,
    textDecorationLine: 'underline'
  },
  accentText: {
    color: colors.accent,
  }
});

export default FooterStyles;
