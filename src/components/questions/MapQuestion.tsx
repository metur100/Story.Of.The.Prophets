import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';
import { PLACES } from '@/content/places';
import type { MapPlaceId, MapQuestion as MapQ } from '@/models';
import { evaluateAnswer } from '@/services/quiz';
import { colors, radius, spacing } from '@/theme';

/** Map interaction: a simple illustrated map of the lands of the stories with tappable places. */
export function MapQuestion({ question, onAnswered, locked }: { question: MapQ; onAnswered: (r: { correct: boolean; correctAnswer: string }) => void; locked: boolean }) {
  const { t } = useI18n();
  const feedback = useFeedback();
  const [picked, setPicked] = useState<MapPlaceId | null>(null);
  const name = (id: MapPlaceId) => t(`place.${id}` as TranslationKey);

  const choose = (place: MapPlaceId) => {
    if (picked || locked) return;
    feedback.tap();
    setPicked(place);
    onAnswered({ correct: evaluateAnswer(question, { type: 'place', place }), correctAnswer: name(question.correctPlace) });
  };

  return (
    <View style={styles.root}>
      <AppText variant="small" color={colors.textMuted}>
        {t('q.map.hint')}
      </AppText>
      <View style={styles.map}>
        <Svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          <Rect x={0} y={0} width={400} height={300} fill="#BFE0EE" />
          {/* Land: Egypt & Sinai, the Levant, Mesopotamia and the Arabian Peninsula (stylised) */}
          <Path
            d="M0 70 L120 80 L150 60 L230 20 L330 10 L400 30 L400 300 L330 300 L300 230 L250 290 L210 300 L180 240 L150 190 L120 170 L110 300 L0 300 Z"
            fill="#EBD3A0"
          />
          {/* Red Sea */}
          <Path d="M120 168 L150 190 L180 240 L210 300 L190 300 L160 245 L132 200 L112 175 Z" fill="#BFE0EE" />
          {/* Persian Gulf */}
          <Path d="M330 150 Q360 170 372 205 Q350 200 330 185 Q318 168 330 150 Z" fill="#BFE0EE" />
          {/* Mediterranean coast shading */}
          <Path d="M0 70 L120 80 L150 60 L150 50 L0 55 Z" fill="#BFE0EE" />
          {/* Nile */}
          <Path d="M92 300 C95 240 88 200 96 150 C100 120 98 100 104 82" stroke="#4FA3D1" strokeWidth={4} fill="none" />
          {/* Tigris & Euphrates */}
          <Path d="M265 40 C285 80 300 110 335 155" stroke="#4FA3D1" strokeWidth={3} fill="none" />
          <Path d="M240 50 C255 95 285 125 330 155" stroke="#4FA3D1" strokeWidth={3} fill="none" />
          {/* Mountains near Judi */}
          <Path d="M255 50 L270 28 L285 50 Z M275 48 L290 30 L305 48 Z" fill="#B49870" />
          {(question.places as MapPlaceId[]).map((id) => {
            const p = PLACES[id];
            const isCorrect = picked !== null && id === question.correctPlace;
            const isWrong = picked === id && id !== question.correctPlace;
            return (
              <Circle
                key={id}
                cx={p.x}
                cy={p.y}
                r={11}
                fill={isCorrect ? colors.success : isWrong ? colors.error : colors.gold}
                stroke="#FFFFFF"
                strokeWidth={3}
              />
            );
          })}
        </Svg>
        {(question.places as MapPlaceId[]).map((id) => {
          const p = PLACES[id];
          return (
            <Pressable
              key={id}
              onPress={() => choose(id)}
              disabled={!!picked || locked}
              accessibilityRole="button"
              accessibilityLabel={name(id)}
              style={[styles.hit, { left: `${(p.x / 400) * 100}%`, top: `${(p.y / 300) * 100}%` }]}
            >
              <View style={styles.label}>
                <AppText variant="tiny" color={colors.night}>
                  {name(id)}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  map: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  hit: {
    position: 'absolute',
    width: 96,
    height: 56,
    marginLeft: -48,
    marginTop: -24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  label: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
});
