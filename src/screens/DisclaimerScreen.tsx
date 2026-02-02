import React, { useState, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { getDatabase } from "../database/init";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

// ============================================================================
// DISCLAIMER CONTENT
// ============================================================================

const DISCLAIMER_VERSION = "1.0.0";

const MEDICAL_WARNINGS = [
  "You have any cardiovascular conditions (heart disease, high blood pressure, etc.)",
  "You have any musculoskeletal conditions or injuries",
  "You have diabetes or metabolic disorders",
  "You are pregnant or postpartum",
  "You have been sedentary for an extended period",
  "You are over 40 years of age and have not exercised regularly",
  "You have any chronic health conditions",
  "You are taking any medications that may affect your ability to exercise",
];

const STOP_SYMPTOMS = [
  "Chest pain or pressure",
  "Difficulty breathing or shortness of breath",
  "Dizziness, lightheadedness, or feeling faint",
  "Nausea or vomiting",
  "Sharp or sudden pain in any joint or muscle",
  "Heart palpitations or irregular heartbeat",
  "Extreme fatigue or exhaustion",
  "Any other unusual symptoms",
];

const ACKNOWLEDGEMENTS = [
  "I have read and understood this Health and Fitness Disclaimer",
  "I understand that ATAVIA does not provide medical advice",
  "I will consult a physician before beginning any exercise programme",
  "I understand the risks associated with physical exercise",
  "I voluntarily assume all risks of injury or illness",
  "I am solely responsible for my health and safety",
  "I will stop exercising immediately if I experience any warning signs",
  "I will follow all safety guidelines and stop rules in the App",
];

// ============================================================================
// TYPES
// ============================================================================

type DisclaimerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Disclaimer"
>;

interface Props {
  navigation: DisclaimerScreenNavigationProp;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DisclaimerScreen({ navigation }: Props) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Track scroll position to enable accept button
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // Accept disclaimer and save to database
  const handleAccept = async () => {
    if (!hasScrolledToBottom || isAccepting) return;

    setIsAccepting(true);
    try {
      const db = getDatabase();
      await db.runAsync(
        `UPDATE app_settings
         SET disclaimer_accepted = 1,
             disclaimer_accepted_at = datetime('now'),
             disclaimer_version = ?
         WHERE id = 'app_settings'`,
        [DISCLAIMER_VERSION]
      );

      console.log("[Disclaimer] Disclaimer accepted, navigating to ProgramSelection");
      navigation.replace("ProgramSelection");
    } catch (error) {
      console.error("[Disclaimer] Failed to save disclaimer acceptance:", error);
      setIsAccepting(false);
    }
  };

  // Open external legal pages
  const openPrivacyPolicy = () => {
    Linking.openURL("https://dravora.com/atavia/privacy");
  };

  const openTermsOfService = () => {
    Linking.openURL("https://dravora.com/atavia/terms");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Health & Safety</Text>
          <Text style={styles.subtitle}>
            Please read this important information before using ATAVIA
          </Text>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>IMPORTANT DISCLAIMER</Text>
          <Text style={styles.warningText}>
            This application is intended for informational and educational purposes
            only. It is NOT a substitute for professional medical advice, diagnosis,
            or treatment.
          </Text>
        </View>

        {/* Not Medical Advice Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Not Medical Advice</Text>
          <Text style={styles.sectionText}>
            ATAVIA and its content, including training programmes, readiness
            assessments, exercise instructions, and recommendations, are provided
            for general informational purposes only. The App does not provide
            medical advice and is not intended to be used for medical diagnosis or
            treatment.
          </Text>
        </View>

        {/* Consult Your Physician Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consult Your Physician</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              You must consult with a qualified healthcare professional before
              starting any exercise programme, particularly if you have any
              pre-existing health conditions.
            </Text>
          </View>
          <Text style={styles.sectionText}>
            You should consult a physician before using ATAVIA if:
          </Text>
          <View style={styles.bulletList}>
            {MEDICAL_WARNINGS.map((warning, index) => (
              <Text key={index} style={styles.bulletItem}>
                {UNICODE.BULLET} {warning}
              </Text>
            ))}
          </View>
        </View>

        {/* Assumption of Risk Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assumption of Risk</Text>
          <Text style={styles.sectionText}>
            Physical exercise carries inherent risks, including but not limited to
            muscle strains, sprains, fractures, joint injuries, and cardiovascular
            events. By using ATAVIA, you acknowledge that you are voluntarily
            participating in physical activities at your own risk and are solely
            responsible for your health and safety during exercise.
          </Text>
        </View>

        {/* Stop Immediately Section */}
        <View style={styles.stopSection}>
          <Text style={styles.stopTitle}>Stop Exercising Immediately If You Experience:</Text>
          <View style={styles.bulletList}>
            {STOP_SYMPTOMS.map((symptom, index) => (
              <Text key={index} style={styles.stopBulletItem}>
                {UNICODE.BULLET} {symptom}
              </Text>
            ))}
          </View>
          <Text style={styles.stopWarning}>
            If you experience any of these symptoms, stop exercising immediately
            and seek medical attention.
          </Text>
        </View>

        {/* Limitation of Liability Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            To the maximum extent permitted by Australian law, Dravora and its
            officers, directors, employees, and agents shall not be liable for any
            personal injury, illness, death, property damage, or any direct,
            indirect, incidental, consequential, or punitive damages arising from
            or related to your use of ATAVIA or any exercise or activity performed
            in connection with the App.
          </Text>
        </View>

        {/* Acknowledgement Section */}
        <View style={styles.acknowledgementSection}>
          <Text style={styles.acknowledgementTitle}>
            By Tapping "I Understand & Accept", You Acknowledge:
          </Text>
          <View style={styles.bulletList}>
            {ACKNOWLEDGEMENTS.map((item, index) => (
              <Text key={index} style={styles.acknowledgementItem}>
                {index + 1}. {item}
              </Text>
            ))}
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <Text style={styles.legalLinksTitle}>Full Legal Documents:</Text>
          <TouchableOpacity onPress={openPrivacyPolicy}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openTermsOfService}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Scroll Prompt */}
        {!hasScrolledToBottom && (
          <View style={styles.scrollPrompt}>
            <Text style={styles.scrollPromptText}>
              {UNICODE.ARROW_DOWN} Scroll to read the full disclaimer {UNICODE.ARROW_DOWN}
            </Text>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Accept Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            !hasScrolledToBottom && styles.acceptButtonDisabled,
          ]}
          onPress={handleAccept}
          disabled={!hasScrolledToBottom || isAccepting}
        >
          <Text
            style={[
              styles.acceptButtonText,
              !hasScrolledToBottom && styles.acceptButtonTextDisabled,
            ]}
          >
            {isAccepting
              ? "Please wait..."
              : hasScrolledToBottom
              ? "I Understand & Accept"
              : "Please read the full disclaimer"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[24],
  },
  header: {
    marginBottom: theme.spacing[6],
    alignItems: "center",
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wide,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  warningBanner: {
    backgroundColor: theme.colors.state.error,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  warningTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wider,
    textAlign: "center",
  },
  warningText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    textAlign: "center",
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[3],
  },
  sectionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[3],
  },
  highlightBox: {
    backgroundColor: theme.colors.surface.elevated,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent.primary,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
  },
  highlightText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
  },
  bulletList: {
    gap: theme.spacing[2],
  },
  bulletItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    paddingLeft: theme.spacing[2],
  },
  stopSection: {
    backgroundColor: "rgba(139, 38, 53, 0.15)",
    borderWidth: 2,
    borderColor: theme.colors.state.error,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  stopTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.state.errorLight,
    marginBottom: theme.spacing[3],
  },
  stopBulletItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    paddingLeft: theme.spacing[2],
  },
  stopWarning: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing[4],
  },
  acknowledgementSection: {
    backgroundColor: theme.colors.surface.base,
    borderWidth: 2,
    borderColor: theme.colors.state.success,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  acknowledgementTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.state.successLight,
    marginBottom: theme.spacing[4],
  },
  acknowledgementItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[2],
  },
  legalLinks: {
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },
  legalLinksTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
  },
  legalLink: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.accent.tertiary,
    textDecorationLine: "underline",
    marginVertical: theme.spacing[1],
  },
  scrollPrompt: {
    alignItems: "center",
    paddingVertical: theme.spacing[4],
  },
  scrollPromptText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontStyle: "italic",
  },
  bottomPadding: {
    height: theme.spacing[20],
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    borderTopWidth: theme.borderWidth.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  acceptButton: {
    backgroundColor: theme.colors.state.success,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  acceptButtonDisabled: {
    backgroundColor: theme.colors.surface.base,
  },
  acceptButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  acceptButtonTextDisabled: {
    color: theme.colors.text.disabled,
  },
});
