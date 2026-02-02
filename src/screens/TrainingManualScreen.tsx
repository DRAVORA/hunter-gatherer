import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

// ============================================================================
// LEGAL LINKS
// ============================================================================

const LEGAL_LINKS = [
  { title: "Privacy Policy", url: "https://dravora.com/atavia/privacy" },
  { title: "Terms of Service", url: "https://dravora.com/atavia/terms" },
  { title: "Health Disclaimer", url: "https://dravora.com/atavia/disclaimer" },
  { title: "Support", url: "https://dravora.com/atavia/support" },
];

const PROGRESSION_RULES = [
  "Hit all prescribed sets/reps with clean technique and no stop-rule violations.",
  "Keep 1-2 reps in reserve on the final working set.",
  "If the session was marked VOLUME REDUCED, repeat the same weight next time.",
  "Increase load by the smallest available jump (2.5-5%): 2.5-5 lb for upper body, 5-10 lb for lower body.",
  "If you miss reps or form breaks, keep the same weight and focus on cleaner execution.",
  "Bodyweight progressions: add 1-2 reps per set or slow the tempo before adding load.",
];

const READINESS_RULES = [
  "READY: Train at full volume.",
  "VOLUME REDUCED: Reduce total volume by the percentage shown in the app.",
  "NO PROGRESSION: Complete the session but do not increase weight.",
  "REST DAY: Rest and recover. Resume when readiness returns to READY or VOLUME REDUCED.",
];

const SESSION_FLOW = [
  "Complete the Daily Check-In before training.",
  "Review readiness status and follow the checklist on the Session Readiness screen.",
  "Execute each exercise with strict form and stop-rule compliance.",
  "Log the session, then review the post-session summary for next time.",
];

const STOP_RULES = [
  "Sharp pain, joint instability, or dizziness.",
  "Technique breakdown that cannot be corrected within one set.",
  "Loss of control, bouncing, or uncontrolled range of motion.",
  "Breath-holding beyond intended bracing or seeing stars.",
];

const TRAINING_PURPOSE = [
  "Build durable strength with repeatable, high-quality reps.",
  "Use readiness to manage fatigue and avoid overreaching.",
  "Progress gradually so joints and connective tissue keep pace.",
];

const RECOVERY_CHECKLIST = [
  "Sleep 7–9 hours when possible. Less than 6.5 hours limits progression.",
  "Protein intake: 1.6–2.2g per kg bodyweight per day.",
  "Energy intake: a small caloric surplus is required for muscle gain; maintenance may sustain strength but slows progression.",
  "Hydrate before training (500–750ml minimum).",
  "Eat a balanced meal 60–90 minutes pre-training when possible.",
  "Take rest days seriously when flagged by readiness — recovery is part of training.",
];

const COMMON_QUESTIONS = [
  "When do I increase weight? After you hit all sets/reps cleanly with 1-2 reps in reserve.",
  "What if I feel great on a rest day? Take the rest day and resume next session.",
  "What if I miss reps? Keep the same weight next time and prioritize form.",
];

const SECTION_CARDS = [
  {
    title: "Quick Start",
    description:
      "Follow this flow each training day to keep the program consistent and safe.",
    bullets: SESSION_FLOW,
  },
  {
    title: "Why This Method",
    description:
      "This program prioritizes quality movement over maximum effort so you can train consistently without burnout.",
    bullets: TRAINING_PURPOSE,
  },
  {
    title: "Progression Rules",
    description:
      "Progress happens only after you earn it with clean execution and recovery.",
    bullets: PROGRESSION_RULES,
  },
  {
    title: "Readiness & Volume Adjustments",
    description:
      "The app adjusts volume based on your daily check-in. Follow the status exactly.",
    bullets: READINESS_RULES,
  },
  {
    title: "Stop Rules",
    description:
      "If any stop rule occurs, end the set immediately and reduce intensity next time.",
    bullets: STOP_RULES,
  },
  {
    title: "Recovery Basics",
    description:
      "Recovery drives progress. Treat these as requirements, not suggestions.",
    bullets: RECOVERY_CHECKLIST,
  },
  {
    title: "Common Questions",
    description: "Quick answers to the most frequent training questions.",
    bullets: COMMON_QUESTIONS,
  },
];

type TrainingManualNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TrainingManual"
>;

interface Props {
  navigation: TrainingManualNavigationProp;
}

export default function TrainingManualScreen({ navigation }: Props) {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Training Manual</Text>
          <Text style={styles.subtitle}>
            Read this once, then follow the flow exactly.
          </Text>
        </View>

        {SECTION_CARDS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.description}</Text>
            <View style={styles.bulletList}>
              {section.bullets.map((bullet) => (
                <Text key={bullet} style={styles.bulletItem}>
                  {UNICODE.BULLET} {bullet}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {/* Legal & Support Section */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Legal & Support</Text>
          <Text style={styles.legalDescription}>
            View our policies and get help with ATAVIA.
          </Text>
          <View style={styles.legalLinks}>
            {LEGAL_LINKS.map((link) => (
              <TouchableOpacity
                key={link.title}
                style={styles.legalLink}
                onPress={() => openLink(link.url)}
              >
                <Text style={styles.legalLinkText}>{link.title}</Text>
                <Text style={styles.legalLinkArrow}>{UNICODE.ARROW_RIGHT}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>Ready to Train?</Text>
          <Text style={styles.calloutText}>
            Go back to program selection to start your session.
          </Text>
          <TouchableOpacity
            style={styles.calloutButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.calloutButtonText}>Back to Programs</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  },
  header: {
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  card: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[2],
  },
  cardDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
  },
  bulletList: {
    gap: theme.spacing[2],
  },
  bulletItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
  },
  callout: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    padding: theme.spacing[4],
    marginTop: theme.spacing[2],
  },
  calloutTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  calloutText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  },
  calloutButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.accent.secondaryDark,
    alignItems: "center",
  },
  calloutButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  legalSection: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  legalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[2],
  },
  legalDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  legalLinks: {
    gap: theme.spacing[2],
  },
  legalLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface.interactive,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
  },
  legalLinkText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.accent.tertiary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  legalLinkArrow: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
  },
});
