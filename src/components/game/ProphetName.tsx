import { StyleSheet, View } from 'react-native';

import { AppText, type TextVariant } from '@/components/ui/AppText';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';
import type { Story } from '@/models';
import { colors } from '@/theme';

/** Prophet's name with the respectful honorific (ﷺ for Muhammad, "peace be upon him" for the others). */
export function ProphetName({ story, variant = 'heading', dark }: { story: Story; variant?: TextVariant; dark?: boolean }) {
  const { t, l } = useI18n();
  const isMuhammad = story.honorific === 'sallallahu-alayhi-wa-sallam';
  return (
    <View style={styles.row}>
      <AppText variant={variant} color={dark ? colors.textOnDark : colors.text}>
        {l(story.prophetName)}
        {isMuhammad ? ' ﷺ' : ''}
      </AppText>
      {!isMuhammad ? (
        <AppText variant="tiny" color={dark ? colors.textOnDarkMuted : colors.textMuted}>
          ({t(`honorific.${story.honorific}` as TranslationKey)})
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 },
});
