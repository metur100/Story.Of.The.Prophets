import { router } from 'expo-router';
import { useState } from 'react';

import { RewardAnimation } from '@/components/game/RewardAnimation';
import { QuestionView } from '@/components/questions/QuestionView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { useI18n } from '@/hooks/useI18n';
import { useProgress } from '@/hooks/useProgress';
import { dailyQuestionFor } from '@/services/daily';
import { useGameStore } from '@/store/gameStore';

/** Daily question: one question per day from stories the child has already opened. */
export default function DailyScreen() {
  const { t } = useI18n();
  const progress = useProgress();
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeDaily = useGameStore((s) => s.completeDaily);
  const [day] = useState(progress.today);
  const [alreadyDone] = useState(progress.dailyDone);
  const [question] = useState(() => dailyQuestionFor(day, progress.openStories));
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  if (alreadyDone || !question) {
    return (
      <Screen header={<TopBar title={t('daily.title')} />}>
        <EmptyState
          icon={alreadyDone ? 'check' : 'scroll'}
          title={t('daily.title')}
          body={alreadyDone ? t('daily.already') : t('home.dailyNone')}
          actionLabel={t('common.back')}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  if (finished) {
    return (
      <Screen header={<TopBar title={t('daily.title')} />}>
        <AppText variant="title" align="center">
          {t('daily.doneTitle')}
        </AppText>
        <RewardAnimation xp={xp} label={t('daily.title')} />
        <Button label={t('common.done')} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen header={<TopBar title={t('daily.title')} backIcon="close" />}>
      <QuestionView
        question={question}
        onResult={(correct) => setXp((x) => x + recordAnswer(question, correct, 'daily'))}
        onContinue={() => {
          setXp((x) => x + completeDaily(day));
          setFinished(true);
        }}
      />
    </Screen>
  );
}
