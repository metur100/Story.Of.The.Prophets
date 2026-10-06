import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProphetName } from '@/components/game/ProphetName';
import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { LockedContent } from '@/components/ui/LockedContent';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SourceList } from '@/components/ui/SourceList';
import { Stars } from '@/components/ui/Stars';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { getStory, STORIES } from '@/content';
import { useI18n } from '@/hooks/useI18n';
import { storyStatus, unlockingStory } from '@/services/unlocking';
import { useGameStore } from '@/store/gameStore';
import { colors, spacing } from '@/theme';

export default function StoryOverview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useI18n();
  const insets = useSafeAreaInsets();
  const progress = useGameStore((s) => s.game.stories);
  const run = useGameStore((s) => s.game.run);
  const story = getStory(String(id));

  if (!story) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="scroll" title={t('story.notFound')} />
      </Screen>
    );
  }

  const status = storyStatus(story, progress, STORIES);
  const previous = unlockingStory(story, STORIES);
  const resumable = run?.storyId === story.id;
  const play = () => router.push({ pathname: '/play/[id]', params: { id: story.id } });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[colors.night, '#2E3380']} style={[styles.header, { paddingTop: insets.top }]}>
          <TopBar dark />
          <SceneView scene={story.cover} height={200} />
          <ProphetName story={story} variant="title" dark />
          <AppText variant="heading" color={colors.gold}>
            {l(story.title)}
          </AppText>
          <AppText variant="body" color={colors.textOnDarkMuted}>
            {l(story.description)}
          </AppText>
          {status === 'completed' ? <Stars count={progress[story.id]?.bestStars ?? 0} size={22} dark /> : null}
        </LinearGradient>

        <View style={styles.body}>
          {status === 'locked' && previous ? (
            <LockedContent message={t('map.lockedBecause', { name: l(previous.prophetName) })} />
          ) : (
            <Button
              label={resumable ? t('story.resume') : status === 'completed' ? t('story.replay') : t('story.start')}
              icon="play"
              variant="gold"
              onPress={play}
            />
          )}

          <SectionHeader title={t('story.overview')} />
          <Card>
            <View style={styles.row}>
              <Icon name="map" size={20} color={colors.primary} />
              <AppText variant="body" style={styles.flex}>
                {t('story.place')}: {l(story.place)}
              </AppText>
            </View>
            <View style={styles.row}>
              <Icon name="scroll" size={20} color={colors.primary} />
              <AppText variant="body" style={styles.flex}>
                {t('story.scenes', { count: story.scenes.length })}
              </AppText>
            </View>
            <View style={styles.row}>
              <Icon name="info" size={20} color={colors.textMuted} />
              <AppText variant="small" color={colors.textMuted} style={styles.flex}>
                {t('story.symbolNote')}
              </AppText>
            </View>
          </Card>

          <SectionHeader title={t('story.lessons')} />
          {story.lessons.map((lesson) => (
            <Card key={lesson.id} tone="gold">
              <AppText variant="bodyBold">{l(lesson.title)}</AppText>
            </Card>
          ))}

          <SourceList sources={story.sources} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  body: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  flex: { flex: 1 },
});
