import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ProphetName } from '@/components/game/ProphetName';
import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Icon } from '@/components/ui/Icon';
import { LockedContent } from '@/components/ui/LockedContent';
import { Stars } from '@/components/ui/Stars';
import { STORIES } from '@/content';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { storyStatus, unlockingStory } from '@/services/unlocking';
import { useGameStore } from '@/store/gameStore';
import { colors, radius, shadow, spacing } from '@/theme';

/** Timeline of the prophets. Each story is a place marked by a symbolic object – never a person. */
export default function StoryMap() {
  const { t, l } = useI18n();
  const feedback = useFeedback();
  const stories = useGameStore((s) => s.game.stories);
  const run = useGameStore((s) => s.game.run);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="display" color={colors.textOnDark} accessibilityRole="header">
          {t('map.title')}
        </AppText>
        <AppText variant="body" color={colors.textOnDarkMuted}>
          {t('map.subtitle')}
        </AppText>
      </HeroHeader>

      <View style={styles.timeline}>
        <View style={styles.line} />
        {STORIES.map((story, index) => {
          const status = storyStatus(story, stories, STORIES);
          const previous = unlockingStory(story, STORIES);
          const inProgress = run?.storyId === story.id;
          const locked = status === 'locked';
          return (
            <View key={story.id} style={[styles.stop, index % 2 === 1 && styles.stopRight]}>
              <View style={[styles.dot, status === 'completed' && styles.dotDone, locked && styles.dotLocked]}>
                {status === 'completed' ? (
                  <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <AppText variant="tiny" color="#FFFFFF">
                    {index + 1}
                  </AppText>
                )}
              </View>
              <Pressable
                onPress={() => {
                  feedback.tap();
                  router.push({ pathname: '/story/[id]', params: { id: story.id } });
                }}
                accessibilityRole="button"
                accessibilityLabel={`${l(story.prophetName)}: ${l(story.title)}. ${
                  locked && previous ? t('map.lockedBecause', { name: l(previous.prophetName) }) : status === 'completed' ? t('map.completed') : ''
                }`}
                style={({ pressed }) => [styles.card, locked && styles.cardLocked, pressed && styles.pressed]}
              >
                <SceneView scene={{ sky: story.cover.sky, elements: [story.symbol] }} height={96} rounded={false} style={locked ? styles.dim : undefined} />
                <View style={styles.cardBody}>
                  <ProphetName story={story} variant="bodyBold" />
                  <AppText variant="small" color={colors.goldDeep}>
                    {l(story.title)}
                  </AppText>
                  <AppText variant="tiny" color={colors.textMuted}>
                    {l(story.place)}
                  </AppText>
                  {status === 'completed' ? <Stars count={stories[story.id]?.bestStars ?? 0} size={14} /> : null}
                  {inProgress ? (
                    <AppText variant="tiny" color={colors.primary}>
                      {t('map.inProgress')}
                    </AppText>
                  ) : null}
                  {locked && previous ? <LockedContent message={t('map.lockedBecause', { name: l(previous.prophetName) })} /> : null}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  timeline: { padding: spacing.lg, gap: spacing.lg },
  line: {
    position: 'absolute',
    left: '50%',
    top: spacing.xl,
    bottom: spacing.xl,
    width: 4,
    marginLeft: -2,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  stop: { alignItems: 'flex-start', paddingRight: '18%' },
  stopRight: { alignItems: 'flex-end', paddingRight: 0, paddingLeft: '18%' },
  dot: {
    position: 'absolute',
    left: '50%',
    top: 8,
    marginLeft: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 3,
    borderColor: colors.sand,
  },
  dotDone: { backgroundColor: colors.success },
  dotLocked: { backgroundColor: colors.locked },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardLocked: { opacity: 0.85 },
  pressed: { transform: [{ scale: 0.98 }] },
  dim: { opacity: 0.45 },
  cardBody: { padding: spacing.md, gap: 2 },
});
