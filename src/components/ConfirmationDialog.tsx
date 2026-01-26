import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { theme } from "../styles/theme";

// ============================================================================
// CONFIRMATION DIALOG COMPONENT
// ============================================================================
// Modal overlay for confirming critical actions
// Yes/No buttons
// Dismissable by tapping outside
// ============================================================================

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay.heavy,
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.default,
    padding: theme.spacing[6],
    width: "80%",
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[3],
    color: theme.colors.text.primary,
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing[6],
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface.interactive,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
  },
  confirmButton: {
    backgroundColor: theme.colors.accent.primary,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  confirmButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: "center",
  },
});
