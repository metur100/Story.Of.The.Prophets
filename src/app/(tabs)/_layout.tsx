import { Tabs } from 'expo-router/js-tabs';

import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { useI18n } from '@/hooks/useI18n';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      tabBar={(props) => <BottomNavigation state={props.state} navigation={props.navigation} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.sand } }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="map" options={{ title: t('tabs.map') }} />
      <Tabs.Screen name="review" options={{ title: t('tabs.review') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}
