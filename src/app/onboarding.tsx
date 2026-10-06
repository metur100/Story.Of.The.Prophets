import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PatternBackground } from '@/components/ui/PatternBackground';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { LANGUAGE_NAMES } from '@/localization/i18n';
import { LANGUAGES } from '@/models';
import { useGameStore } from '@/store/gameStore';
import { colors, fonts, radius, spacing } from '@/theme';
import { isValidName, MAX_NAME_LENGTH } from '@/utils/validation';

export default function Onboarding() {
  const { t, language } = useI18n();
  const feedback = useFeedback();
  const updateSettings = useGameStore((s) => s.updateSettings);
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const valid = isValidName(name);

  const start = () => {
    setTouched(true);
    if (!valid) return;
    completeOnboarding(name, language);
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={[colors.night, '#2B2F72']} style={styles.root}>
      <PatternBackground />
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <SceneView scene={{ sky: 'night', elements: ['stars', 'crescent', 'mountains', 'dunes', 'caravan'] }} height={210} />
            <AppText variant="display" color={colors.gold} align="center" accessibilityRole="header">
              {t('onboarding.title')}
            </AppText>
            <AppText variant="body" color={colors.textOnDark} align="center">
              {t('onboarding.subtitle')}
            </AppText>

            <AppText variant="heading" color={colors.textOnDark}>
              {t('onboarding.language')}
            </AppText>
            <View style={styles.langRow} accessibilityRole="radiogroup">
              {LANGUAGES.map((lang) => {
                const active = lang === language;
                return (
                  <Pressable
                    key={lang}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={LANGUAGE_NAMES[lang]}
                    onPress={() => {
                      feedback.tap();
                      updateSettings({ language: lang });
                    }}
                    style={[styles.lang, active && styles.langActive]}
                  >
                    {active ? <Icon name="check" size={18} color={colors.night} strokeWidth={3} /> : null}
                    <AppText variant="bodyBold" color={active ? colors.night : colors.textOnDark}>
                      {LANGUAGE_NAMES[lang]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="heading" color={colors.textOnDark}>
              {t('onboarding.name')}
            </AppText>
            <TextInput
              value={name}
              onChangeText={(v) => setName(v.slice(0, MAX_NAME_LENGTH))}
              placeholder={t('onboarding.namePlaceholder')}
              placeholderTextColor="#8E92B8"
              accessibilityLabel={t('onboarding.namePlaceholder')}
              maxLength={MAX_NAME_LENGTH}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={start}
              style={styles.input}
            />
            <AppText variant="small" color={touched && !valid ? colors.gold : colors.textOnDarkMuted}>
              {touched && !valid ? t('onboarding.nameError') : t('onboarding.nameHint')}
            </AppText>
          </ScrollView>
          <View style={styles.footer}>
            <Button label={t('onboarding.start')} variant="gold" iconRight="chevron" onPress={start} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.lg },
  langRow: { flexDirection: 'row', gap: spacing.sm },
  lang: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  input: {
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
});
