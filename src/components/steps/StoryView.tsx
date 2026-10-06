import { StyleSheet, View } from 'react-native';

import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { SourceList } from '@/components/ui/SourceList';
import { useI18n } from '@/hooks/useI18n';
import type { LocalizedText, SceneSpec, SourceRef, StoryLesson } from '@/models';
import { colors, radius, spacing } from '@/theme';

interface StoryViewProps {
  label: string;
  title?: LocalizedText;
  body: LocalizedText;
  scene: SceneSpec;
  sources?: SourceRef[];
  large?: boolean;
}

/** A story page: symbolic illustration (never a depiction of a prophet) and narration. */
export function StoryView({ label, title, body, scene, sources, large }: StoryViewProps) {
  const { l } = useI18n();
  return (
    <View style={styles.root}>
      <SceneView scene={scene} height={large ? 240 : 200} />
      <View style={styles.page}>
        <AppText variant="label" color={colors.goldDeep}>
          {label.toUpperCase()}
        </AppText>
        {title ? (
          <AppText variant="title" accessibilityRole="header">
            {l(title)}
          </AppText>
        ) : null}
        <AppText variant="body" style={styles.body}>
          {l(body)}
        </AppText>
      </View>
      <SourceList sources={sources} />
    </View>
  );
}

/** "What did we learn?" – each lesson with explanation, practical example and reflection question. */
export function LessonsView({ lessons }: { lessons: StoryLesson[] }) {
  const { t, l } = useI18n();
  return (
    <View style={styles.root}>
      <AppText variant="title" accessibilityRole="header">
        {t('player.lessonsTitle')}
      </AppText>
      {lessons.map((lesson, index) => (
        <View key={lesson.id} style={styles.lesson}>
          <View style={styles.lessonHeader}>
            <View style={styles.number}>
              <AppText variant="bodyBold" color={colors.night}>
                {index + 1}
              </AppText>
            </View>
            <AppText variant="heading" style={styles.flex}>
              {l(lesson.title)}
            </AppText>
          </View>
          <AppText variant="body">{l(lesson.explanation)}</AppText>
          <View style={styles.example}>
            <AppText variant="label" color={colors.primaryDark}>
              {t('player.example').toUpperCase()}
            </AppText>
            <AppText variant="body">{l(lesson.example)}</AppText>
          </View>
          <View style={styles.reflection}>
            <Icon name="sparkle" size={18} color={colors.goldDeep} />
            <View style={styles.flex}>
              <AppText variant="label" color={colors.goldDeep}>
                {t('player.reflection').toUpperCase()}
              </AppText>
              <AppText variant="bodyBold">{l(lesson.reflection)}</AppText>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  page: {
    backgroundColor: '#FFFBF2',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#EBDDBF',
  },
  body: { fontSize: 17, lineHeight: 27 },
  lesson: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  number: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  example: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  reflection: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
