import { StyleSheet } from "react-native";
import { colors } from "../Styles";

const TelemetryCardsStyles = StyleSheet.create({
  card: {
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    margin: 3,
    height: "98%",
    width: "48%",
  },
  page: {
    padding: 16,
  },
  dot: {
    borderRadius: 90,
    height: 8,
    width: 8,
    margin: 4,
    marginBottom: 8,
    backgroundColor: colors.muted,
  },
  dotActive: {
    borderRadius: 90,
    height: 12,
    width: 12,
    margin: 4,
    marginBottom: 8,
    backgroundColor: colors.accent,
  },
});

export default TelemetryCardsStyles;
