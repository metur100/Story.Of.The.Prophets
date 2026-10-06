import { type ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { RewardAnimation } from '@/components/game/RewardAnimation';
import { QuestionView } from '@/components/questions/QuestionView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/States';
import { getQuestion } from '@/content';
import { useI18n } from '@/hooks/useI18n';
import { useProgress } from '@/hooks/useProgress';
import { LOCALE_TAGS } from '@/localization/i18n';
import type { Question } from '@/models';
import { nextReviewDate } from '@/services/review';
import { useGameStore } from '@/store/gameStore';
import { colors, spacing } from '@/theme';

const SESSION_SIZE = 8;

/** Review screen: questions answered with "Not quite" come back here, weakest first. */
export default function ReviewTab() {
  const { t, language } = useI18n();
  const review = useGameStore((s) => s.game.review);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeSession = useGameStore((s) => s.completeReviewSession);
  const progress = useProgress();
  const [session, setSession] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  const start = () => {
    setSession(
      progress.dueReviews
        .slice(0, SESSION_SIZE)
        .map((item) => getQuestion(item.questionId))
        .filter((q): q is Question => q !== undefined),
    );
    setIndex(0);
    setResults([]);
    setXp(0);
    setFinished(false);
  };

  const reset = () => {
    setSession(null);
    setFinished(false);
  };

  const header = (
    <HeroHeader>
      <AppText variant="display" color={colors.textOnDark} accessibilityRole="header">
        {t('review.title')}
      </AppText>
      <AppText variant="body" color={colors.textOnDarkMuted}>
        {t('review.subtitle')}
      </AppText>
      {session && !finished ? <ProgressBar progress={index / session.length} color={colors.gold} trackColor="rgba(255,255,255,0.2)" /> : null}
    </HeroHeader>
  );

  let body: ReactNode;
  if (finished && session) {
    const correct = results.filter(Boolean).length;
    body = (
      <>
        <AppText variant="title" align="center">
          {t('review.doneTitle')}
        </AppText>
        <RewardAnimation xp={xp} label={t('review.doneBody', { correct, total: results.length })} />
        <Button label={t('common.done')} onPress={reset} />
      </>
    );
  } else if (session && session.length > 0) {
    const question = session[index];
    body = (
      <QuestionView
        key={question.id}
        question={question}
        onResult={(correct) => {
          setResults((r) => [...r, correct]);
          setXp((x) => x + recordAnswer(question, correct, 'review'));
        }}
        onContinue={() => {
          if (index + 1 < session.length) setIndex(index + 1);
          else {
            completeSession();
            setFinished(true);
          }
        }}
      />
    );
  } else if (progress.dueReviews.length > 0) {
    body = (
      <Card tone="primary">
        <AppText variant="heading">{t('review.pending', { count: progress.pendingReviews })}</AppText>
        <View style={styles.mt}>
          <Button label={t('review.start', { count: Math.min(progress.dueReviews.length, SESSION_SIZE) })} icon="play" onPress={start} />
        </View>
      </Card>
    );
  } else {
    const next = nextReviewDate(review);
    body = (
      <EmptyState
        icon="check"
        title={t('review.emptyTitle')}
        body={
          next
            ? t('review.next', {
                date: new Date(next).toLocaleDateString(LOCALE_TAGS[language], { weekday: 'long', day: 'numeric', month: 'long' }),
              })
            : t('review.emptyBody')
        }
      />
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      {header}
      <View style={styles.body}>{body}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl * 2 },
  body: { padding: spacing.lg, gap: spacing.lg },
  mt: { marginTop: spacing.md },
});
