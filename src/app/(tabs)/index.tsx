import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ProphetName } from '@/components/game/ProphetName';
import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stars } from '@/components/ui/Stars';
import { XPBar } from '@/components/ui/XPBar';
import { getStory, STORIES } from '@/content';
import { useI18n } from '@/hooks/useI18n';
import { useProgress } from '@/hooks/useProgress';
import { buildStoryFlow } from '@/services/storyFlow';
import { useGameStore } from '@/store/gameStore';
import { colors, spacing } from '@/theme';

export default function Home() {
  const { t, l } = useI18n();
  const game = useGameStore((s) => s.game);
  const progress = useProgress();
  const runStory = game.run ? getStory(game.run.storyId) : undefined;
  const runTotal = runStory ? buildStoryFlow(runStory).length : 0;
  const continueStory = runStory ?? progress.next;
  const open = (id: string) => router.push({ pathname: '/story/[id]', params: { id } });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="title" color={colors.textOnDark}>
          {t('home.greeting', { name: game.name })}
        </AppText>
        <AppText variant="body" color={colors.textOnDarkMuted}>
          {t('home.subtitle')}
        </AppText>
        <XPBar xp={game.xp} dark />
      </HeroHeader>

      <View style={styles.body}>
        <SectionHeader title={runStory ? t('home.continue') : t('home.startNext')} />
        {continueStory ? (
          <Card
            padded={false}
            onPress={() => (runStory ? router.push({ pathname: '/play/[id]', params: { id: runStory.id } }) : open(continueStory.id))}
            accessibilityLabel={`${l(continueStory.prophetName)}: ${l(continueStory.title)}`}
          >
            <SceneView scene={continueStory.cover} height={130} rounded={false} />
            <View style={styles.cardBody}>
              <View style={styles.flex}>
                <ProphetName story={continueStory} />
                <AppText variant="bodyBold" color={colors.goldDeep}>
                  {l(continueStory.title)}
                </AppText>
                {runStory && game.run ? (
                  <>
                    <AppText variant="small" color={colors.textMuted}>
                      {t('home.continueStep', { current: game.run.stepIndex + 1, total: runTotal })}
                    </AppText>
                    <ProgressBar progress={(game.run.stepIndex + 1) / runTotal} color={colors.gold} height={8} />
                  </>
                ) : (
                  <AppText variant="small" color={colors.textMuted}>
                    {l(continueStory.description)}
                  </AppText>
                )}
              </View>
              <View style={styles.play}>
                <Icon name="play" size={22} color="#FFFFFF" />
              </View>
            </View>
          </Card>
        ) : (
          <Card tone="primary">
            <AppText variant="bodyBold">{t('home.allDone')}</AppText>
          </Card>
        )}

        <Card tone="gold" onPress={() => router.push('/daily')} accessibilityLabel={t('home.daily')}>
          <View style={styles.row}>
            <View style={styles.dailyIcon}>
              <Icon name={progress.dailyDone ? 'check' : 'sun'} size={24} color={colors.night} />
            </View>
            <View style={styles.flex}>
              <AppText variant="heading">{t('home.daily')}</AppText>
              <AppText variant="small" color={colors.textMuted}>
                {progress.dailyDone ? t('home.dailyDone') : progress.openStories.length ? '+15 XP' : t('home.dailyNone')}
              </AppText>
            </View>
            <Icon name="chevron" size={20} color={colors.textMuted} />
          </View>
        </Card>

        {progress.featured ? (
          <>
            <SectionHeader title={t('home.featured')} />
            <Card padded={false} onPress={() => open(progress.featured!.id)} accessibilityLabel={l(progress.featured.title)}>
              <View style={styles.featured}>
                <SceneView scene={{ sky: progress.featured.cover.sky, elements: [progress.featured.symbol] }} height={90} style={styles.featuredScene} />
                <View style={styles.flex}>
                  <ProphetName story={progress.featured} variant="bodyBold" />
                  <AppText variant="small" color={colors.goldDeep}>
                    {l(progress.featured.title)}
                  </AppText>
                  <AppText variant="tiny" color={colors.textMuted} numberOfLines={2}>
                    {l(progress.featured.description)}
                  </AppText>
                </View>
              </View>
            </Card>
          </>
        ) : null}

        <SectionHeader title={t('home.progress')} />
        <View style={styles.stats}>
          <Stat label={t('progress.stories')} value={`${progress.completed.length}/${STORIES.length}`} />
          <Stat label={t('progress.scenes')} value={`${game.completedScenes.length}/${progress.scenesTotal}`} />
          <Stat label={t('progress.lessons')} value={String(game.learnedLessons.length)} />
          <Stat label={t('progress.quiz')} value={`${progress.averageScore}%`} />
        </View>

        <SectionHeader title={t('home.recent')} />
        {progress.recent.length === 0 ? (
          <AppText variant="small" color={colors.textMuted}>
            {t('home.recentEmpty')}
          </AppText>
        ) : (
          progress.recent.map((story) => (
            <Card key={story.id} onPress={() => open(story.id)} accessibilityLabel={l(story.title)}>
              <View style={styles.row}>
                <Icon name="check" size={22} color={colors.success} strokeWidth={3} />
                <View style={styles.flex}>
                  <ProphetName story={story} variant="bodyBold" />
                  <AppText variant="small" color={colors.textMuted}>
                    {l(story.title)}
                  </AppText>
                </View>
                <Stars count={game.stories[story.id]?.bestStars ?? 0} />
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="title" color={colors.primaryDark}>
        {value}
      </AppText>
      <AppText variant="tiny" color={colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.lg },
  flex: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  play: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dailyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  featured: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  featuredScene: { width: 110 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '48.5%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
