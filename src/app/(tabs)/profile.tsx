import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { LinkRow } from '@/components/ui/SettingRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { XPBar } from '@/components/ui/XPBar';
import { STORIES } from '@/content';
import { useI18n } from '@/hooks/useI18n';
import { useProgress } from '@/hooks/useProgress';
import { LOCALE_TAGS, type TranslationKey } from '@/localization/i18n';
import { BADGES } from '@/services/badges';
import { useGameStore } from '@/store/gameStore';
import { colors, radius, spacing } from '@/theme';

export default function Profile() {
  const { t, language } = useI18n();
  const game = useGameStore((s) => s.game);
  const progress = useProgress();

  const stats = [
    { label: t('progress.stories'), value: `${progress.completed.length}/${STORIES.length}` },
    { label: t('progress.scenes'), value: `${game.completedScenes.length}/${progress.scenesTotal}` },
    { label: t('progress.lessons'), value: String(game.learnedLessons.length) },
    { label: t('progress.quiz'), value: `${progress.averageScore}%` },
    { label: t('progress.answers'), value: String(game.stats.correctAnswers) },
    { label: t('progress.reviews'), value: String(game.stats.reviewsCorrect) },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="display" color={colors.textOnDark} accessibilityRole="header">
          {t('profile.title')}
        </AppText>
        <AppText variant="heading" color={colors.gold}>
          {game.name}
        </AppText>
        <XPBar xp={game.xp} dark />
      </HeroHeader>

      <View style={styles.body}>
        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
              <AppText variant="title" color={colors.primaryDark}>
                {s.value}
              </AppText>
              <AppText variant="tiny" color={colors.textMuted}>
                {s.label}
              </AppText>
            </View>
          ))}
        </View>

        <SectionHeader title={`${t('profile.badges')} · ${BADGES.filter((b) => game.badges[b.id]).length}/${BADGES.length}`} />
        {BADGES.map((badge) => {
          const date = game.badges[badge.id];
          return (
            <View key={badge.id} style={[styles.badgeRow, !date && styles.locked]}>
              <Badge id={badge.id} earned={!!date} size={56} showLabel={false} />
              <View style={styles.flex}>
                <AppText variant="bodyBold">{t(`badge.${badge.id}.name` as TranslationKey)}</AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {t(`badge.${badge.id}.desc` as TranslationKey)}
                </AppText>
                <AppText variant="tiny" color={date ? colors.success : colors.textMuted}>
                  {date ? t('badges.earnedOn', { date: new Date(date).toLocaleDateString(LOCALE_TAGS[language]) }) : t('badges.locked')}
                </AppText>
              </View>
            </View>
          );
        })}

        <Card>
          <LinkRow icon="settings" label={t('profile.settings')} onPress={() => router.push('/settings')} />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '48.5%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locked: { opacity: 0.75 },
  flex: { flex: 1, gap: 2 },
});
