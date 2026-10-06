import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { FindQuestion as Find, SkyKind } from '@/models';
import { evaluateAnswer } from '@/services/quiz';
import { colors, radius, spacing } from '@/theme';
import { hashString, seededRandom, shuffle } from '@/utils/random';

import type { QuestionComponentProps } from './types';

const SKY_FOR: Partial<Record<string, SkyKind>> = { whale: 'sea', rain: 'storm', waves: 'sea', fire: 'dusk', sea: 'day' };

/** Find game: every object is a small illustrated scene; the child selects the ones from the story. */
export function FindQuestion({ question, onAnswered, locked }: QuestionComponentProps<Find>) {
  const { t, l } = useI18n();
  const feedback = useFeedback();
  const items = useMemo(() => shuffle(question.items, seededRandom(hashString(question.id))), [question.id, question.items]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    if (submitted || locked) return;
    feedback.tap();
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    setSubmitted(true);
    onAnswered({
      correct: evaluateAnswer(question, { type: 'selection', ids: selected }),
      correctAnswer: question.items
        .filter((i) => question.correctIds.includes(i.id))
        .map((i) => l(i.label))
        .join(', '),
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="small" color={colors.textMuted} style={styles.flex}>
          {t('q.find.hint')}
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          {t('q.find.selected', { count: selected.length })}
        </AppText>
      </View>
      <View style={styles.grid}>
        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          const isCorrect = question.correctIds.includes(item.id);
          const state = submitted ? (isCorrect ? (isSelected ? 'right' : 'missed') : isSelected ? 'wrong' : 'idle') : isSelected ? 'selected' : 'idle';
          return (
            <Pressable
              key={item.id}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: submitted }}
              accessibilityLabel={l(item.label)}
              style={[styles.tile, TILE_STYLES[state]]}
            >
              <SceneView scene={{ sky: SKY_FOR[item.element] ?? 'day', elements: [item.element] }} height={86} rounded={false} />
              <View style={styles.labelRow}>
                <AppText variant="small" style={styles.flex} numberOfLines={1}>
                  {l(item.label)}
                </AppText>
                {state === 'selected' || state === 'right' ? <Icon name="check" size={18} color={colors.success} strokeWidth={3} /> : null}
                {state === 'wrong' ? <Icon name="close" size={18} color={colors.error} strokeWidth={3} /> : null}
                {state === 'missed' ? <Icon name="info" size={18} color={colors.goldDeep} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {!submitted ? <Button label={t('common.check')} onPress={submit} disabled={selected.length === 0 || locked} /> : null}
    </View>
  );
}

const TILE_STYLES = StyleSheet.create({
  idle: {},
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  right: { borderColor: colors.success, backgroundColor: colors.successSoft },
  wrong: { borderColor: colors.error, backgroundColor: colors.errorSoft },
  missed: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
});

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  header: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  tile: {
    width: '48.5%',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.sm, minHeight: 40 },
});
