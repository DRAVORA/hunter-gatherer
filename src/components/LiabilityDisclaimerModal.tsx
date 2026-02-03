import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";

type LiabilityDisclaimerModalProps = {
  visible: boolean;
  onAccept: () => void;
};

export default function LiabilityDisclaimerModal({
  visible,
  onAccept,
}: LiabilityDisclaimerModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Please Review & Accept</Text>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Important Notice</Text>
            <Text style={styles.paragraph}>
              This app provides general fitness guidance and training planning.
              It does not provide medical advice, diagnosis, or treatment. You
              should consult a qualified healthcare professional before starting
              any new fitness program, especially if you have medical conditions
              or injuries.
            </Text>
            <Text style={styles.sectionTitle}>Assumption of Risk</Text>
            <Text style={styles.paragraph}>
              By using this app, you acknowledge that physical activity involves
              inherent risks, including the risk of injury. You agree to use the
              app at your own discretion and assume full responsibility for your
              training decisions and outcomes.
            </Text>
            <Text style={styles.sectionTitle}>No Liability</Text>
            <Text style={styles.paragraph}>
              To the fullest extent permitted by law, the creators and owners of
              this app are not liable for any injury, loss, or damages arising
              from your use of the app or reliance on its content.
            </Text>
            <Text style={styles.paragraph}>
              If you do not agree, please close the app now.
            </Text>
          </ScrollView>
          <Pressable style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>I Accept</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    maxHeight: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E1E1E",
    marginBottom: 12,
  },
  content: {
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#1E1E1E",
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: "#3B3B3B",
  },
  acceptButton: {
    marginTop: 12,
    backgroundColor: "#2B2B2B",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
