import { useMemo } from 'react';

import { useI18n } from '@/hooks/useI18n';
import type { OrderingQuestion as Ordering } from '@/models';
import { evaluateAnswer } from '@/services/quiz';

import { SequenceBuilder } from './SequenceBuilder';
import type { QuestionComponentProps } from './types';

/** Ordering and timeline game: tap the events in the right order. */
export function OrderingQuestion({ question, onAnswered, locked }: QuestionComponentProps<Ordering>) {
  const { t, l } = useI18n();
  const items = useMemo(() => question.items.map((i) => ({ id: i.id, label: l(i.text) })), [question.items, l]);
  return (
    <SequenceBuilder
      items={items}
      seedKey={question.id}
      hint={t('q.ordering.hint')}
      locked={locked}
      revealCorrect
      onSubmit={(ids) =>
        onAnswered({
          correct: evaluateAnswer(question, { type: 'order', ids }),
          correctAnswer: items.map((i) => i.label).join(' → '),
        })
      }
    />
  );
}
