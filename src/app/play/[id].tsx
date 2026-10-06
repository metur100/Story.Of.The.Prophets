import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RewardAnimation } from '@/components/game/RewardAnimation';
import { QuestionView } from '@/components/questions/QuestionView';
import { LessonsView, StoryView } from '@/components/steps/StoryView';
import { Dialog } from '@/components/ui/AppModal';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LockedContent } from '@/components/ui/LockedContent';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Stars } from '@/components/ui/Stars';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { getQuestion, getScene, getStory, STORIES } from '@/content';
import { useI18n } from '@/hooks/useI18n';
import type { Story } from '@/models';
import { buildStoryFlow } from '@/services/storyFlow';
import { nextStory, storyStatus } from '@/services/unlocking';
import { type StoryOutcome, useGameStore } from '@/store/gameStore';
import { colors, spacing } from '@/theme';

export default function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(String(id));
  const { t } = useI18n();
  if (!story) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <TopBar />
        <EmptyState icon="scroll" title={t('story.notFound')} />
      </SafeAreaView>
    );
  }
  // Keyed so moving on to the next story always starts with fresh state.
  return <StoryPlayer key={story.id} story={story} />;
}

function StoryPlayer({ story }: { story: Story }) {
  const { t, l } = useI18n();
  const game = useGameStore((s) => s.game);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const saveStep = useGameStore((s) => s.saveStep);
  const learnLessons = useGameStore((s) => s.learnLessons);
  const completeStory = useGameStore((s) => s.completeStory);
  const setPaused = useGameStore((s) => s.setCelebrationsPaused);
  const flow = buildStoryFlow(story);

  // Resume where the child left off; the status check happens once on entry.
  const [initial] = useState(() => {
    const run = game.run?.storyId === story.id ? game.run : null;
    return {
      status: storyStatus(story, game.stories, STORIES),
      stepIndex: run ? Math.min(run.stepIndex, flow.length - 1) : 0,
      results: run?.results ?? [],
      xp: run?.xpEarned ?? 0,
    };
  });
  const [stepIndex, setStepIndex] = useState(initial.stepIndex);
  const [results, setResults] = useState<boolean[]>(initial.results);
  const [learningXp, setLearningXp] = useState(initial.xp);
  const [outcome, setOutcome] = useState<StoryOutcome | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, [setPaused]);

  useEffect(() => {
    if (outcome) setPaused(false);
  }, [outcome, setPaused]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (outcome) return false;
      setConfirmExit(true);
      return true;
    });
    return () => sub.remove();
  }, [outcome]);

  if (initial.status === 'locked') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <TopBar title={l(story.title)} />
        <View style={styles.content}>
          <LockedContent message={t('common.locked')} />
        </View>
      </SafeAreaView>
    );
  }

  const advance = (nextResults = results, nextXp = learningXp) => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (stepIndex + 1 < flow.length) {
      const next = stepIndex + 1;
      setStepIndex(next);
      saveStep(story, next, nextResults, nextXp);
      return;
    }
    setOutcome(completeStory(story, nextResults, nextXp));
  };

  const exit = () => {
    setConfirmExit(false);
    saveStep(story, stepIndex, results, learningXp);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  if (outcome) {
    const next = nextStory(useGameStore.getState().game.stories, STORIES);
    const total = outcome.xp + outcome.learningXp;
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="display" align="center" accessibilityRole="header">
            {t('reward.title')}
          </AppText>
          <RewardAnimation xp={total} label={t('reward.score', { correct: outcome.score.correct, total: outcome.score.total })} />
          <View style={styles.center}>
            <Stars count={outcome.score.stars} size={36} />
          </View>
          <Card>
            {outcome.learningXp > 0 ? <Line label={t('reward.lines.learning')} xp={outcome.learningXp} /> : null}
            {outcome.lines.map((line) => (
              <Line key={line.kind} label={t(line.kind === 'storyComplete' ? 'reward.lines.storyComplete' : 'reward.lines.perfectBonus')} xp={line.xp} />
            ))}
            {total === 0 ? (
              <AppText variant="small" color={colors.textMuted}>
                {t('reward.noXp')}
              </AppText>
            ) : null}
          </Card>
          <Card tone="gold">
            <AppText variant="label" color={colors.goldDeep}>
              {t('reward.lessons').toUpperCase()}
            </AppText>
            {story.lessons.map((lesson) => (
              <AppText key={lesson.id} variant="bodyBold">
                • {l(lesson.title)}
              </AppText>
            ))}
          </Card>
          {next ? (
            <Button label={t('reward.next')} variant="gold" iconRight="chevron" onPress={() => router.replace({ pathname: '/story/[id]', params: { id: next.id } })} />
          ) : null}
          {results.some((r) => !r) ? (
            <Button label={t('reward.review')} icon="refresh" variant="secondary" onPress={() => router.replace('/(tabs)/review')} />
          ) : null}
          <Button label={t('reward.map')} icon="map" variant="ghost" onPress={() => router.replace('/(tabs)/map')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const step = flow[stepIndex];
  const sceneNumber = (sceneId: string) => story.scenes.findIndex((s) => s.id === sceneId) + 1;

  const body = (() => {
    switch (step.kind) {
      case 'intro':
        return (
          <>
            <StoryView label={t('player.intro')} title={story.title} body={story.intro} scene={story.cover} large />
            <Button label={t('common.start')} iconRight="chevron" onPress={() => advance()} />
          </>
        );
      case 'scene': {
        const scene = getScene(step.sceneId);
        if (!scene) return <Button label={t('common.continue')} onPress={() => advance()} />;
        return (
          <>
            <StoryView label={t('player.scene', { number: sceneNumber(scene.id) })} title={scene.title} body={scene.text} scene={scene.scene} sources={scene.sources} />
            <Button label={t('common.continue')} iconRight="chevron" onPress={() => advance()} />
          </>
        );
      }
      case 'question': {
        const question = getQuestion(step.questionId);
        if (!question) return <Button label={t('common.continue')} onPress={() => advance()} />;
        return (
          <QuestionView
            key={`${stepIndex}-${question.id}`}
            question={question}
            role={step.role}
            onResult={(correct) => {
              setResults((r) => [...r, correct]);
              setLearningXp((x) => x + recordAnswer(question, correct, 'story'));
            }}
            onContinue={() => advance()}
          />
        );
      }
      case 'lessons':
        return (
          <>
            <LessonsView lessons={story.lessons} />
            <Button
              label={t('player.lessonsDone')}
              icon="check"
              onPress={() => {
                const gained = learnLessons(story);
                setLearningXp((x) => x + gained);
                advance(results, learningXp + gained);
              }}
            />
          </>
        );
    }
  })();

  return (
    <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
      <View style={styles.header}>
        <TopBar backIcon="close" backLabel={t('a11y.close')} onBack={() => setConfirmExit(true)} title={l(story.prophetName)} />
        <View style={styles.progressRow}>
          <ProgressBar progress={stepIndex / flow.length} color={colors.gold} style={styles.flex} />
          <AppText variant="tiny" color={colors.textMuted}>
            {stepIndex + 1}/{flow.length}
          </AppText>
        </View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {body}
      </ScrollView>
      <Dialog
        visible={confirmExit}
        title={t('player.exitTitle')}
        body={t('player.exitBody')}
        confirmLabel={t('player.exit')}
        cancelLabel={t('player.stay')}
        onConfirm={exit}
        onCancel={() => setConfirmExit(false)}
      />
    </SafeAreaView>
  );
}

function Line({ label, xp }: { label: string; xp: number }) {
  return (
    <View style={styles.line}>
      <AppText variant="body">{label}</AppText>
      <AppText variant="bodyBold" color={colors.goldDeep}>
        +{xp} XP
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: { paddingBottom: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  flex: { flex: 1, width: undefined },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg },
  center: { alignItems: 'center' },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
