import { StyleSheet } from "react-native";
import { colors } from "./Styles";

export const JOYSTICK_RADIUS = 80;
export const KNOB_RADIUS = 30;
export const MAX_DIST = JOYSTICK_RADIUS - KNOB_RADIUS;

export const localStyles = StyleSheet.create({
  topSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 16,
    gap: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeButtonSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface2,
  },
  modeButtonText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Geist",
  },
  modeButtonTextSelected: {
    color: colors.accent,
  },
  joystickSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  joystickRow: {
    flexDirection: "row",
    gap: 48,
    alignItems: "center",
  },
  joystickWrapper: {
    alignItems: "center",
    gap: 12,
  },
  joystickLabel: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: "Geist",
  },
});

export const joystickStyles = StyleSheet.create({
  base: {
    width: JOYSTICK_RADIUS * 2,
    height: JOYSTICK_RADIUS * 2,
    borderRadius: JOYSTICK_RADIUS,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  guideH: {
    position: "absolute",
    width: "75%",
    height: 1,
    backgroundColor: colors.border,
  },
  guideV: {
    position: "absolute",
    width: 1,
    height: "75%",
    backgroundColor: colors.border,
  },
  knob: {
    position: "absolute",
    width: KNOB_RADIUS * 2,
    height: KNOB_RADIUS * 2,
    borderRadius: KNOB_RADIUS,
    backgroundColor: colors.accent,
  },
});
