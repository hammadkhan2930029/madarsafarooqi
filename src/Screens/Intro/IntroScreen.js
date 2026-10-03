import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import AppText from '../../Components/AppText';
import LanguageSelector from '../../Components/LanguageSelector';
import introSlides from '../../Config/introSlides';
import { useTranslation } from '../../localization/i18n';
import colors from '../../theme/colors';

const IntroScreen = ({ onComplete }) => {
  const { width } = useWindowDimensions();
  const { isRTL, t } = useTranslation();
  const listRef = useRef(null);
  const finishingRef = useRef(false);
  const [index, setIndex] = useState(0);
  const lastIndex = introSlides.length - 1;

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    Promise.resolve(onComplete()).catch(() => {
      finishingRef.current = false;
    });
  }, [onComplete]);

  const goTo = nextIndex => {
    const safeIndex = Math.max(0, Math.min(lastIndex, nextIndex));
    listRef.current?.scrollToIndex({ animated: true, index: safeIndex });
    setIndex(safeIndex);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
        <LanguageSelector compact />
        <TouchableOpacity
          accessibilityLabel={t('intro.skip')}
          disabled={finishingRef.current}
          onPress={finish}
          style={styles.skipButton}
        >
          <AppText style={styles.skipText}>{t('intro.skip')}</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={introSlides}
        decelerationRate="fast"
        horizontal
        keyExtractor={item => item.id}
        onMomentumScrollEnd={event =>
          setIndex(
            Math.max(
              0,
              Math.min(
                lastIndex,
                Math.round(event.nativeEvent.contentOffset.x / width),
              ),
            ),
          )
        }
        pagingEnabled
        ref={listRef}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.imageCard}>
              <Image resizeMode="contain" source={item.image} style={styles.image} />
            </View>
            <AppText align="center" style={styles.title}>
              {t(item.titleKey)}
            </AppText>
            <AppText align="center" style={styles.description}>
              {t(item.descriptionKey)}
            </AppText>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View accessibilityLabel={t('intro.pageIndicator', { current: index + 1, total: introSlides.length })} style={styles.dots}>
          {introSlides.map((slide, dotIndex) => (
            <View
              key={slide.id}
              style={[styles.dot, dotIndex === index && styles.activeDot]}
            />
          ))}
        </View>
        <View style={[styles.actions, isRTL && styles.actionsRTL]}>
          <TouchableOpacity
            disabled={index === 0}
            onPress={() => goTo(index - 1)}
            style={[styles.secondaryButton, index === 0 && styles.hiddenButton]}
          >
            <AppText style={styles.secondaryText}>
              {isRTL ? '→' : '←'} {t('intro.previous')}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={index === lastIndex ? finish : () => goTo(index + 1)}
            style={styles.primaryButton}
          >
            <AppText style={styles.primaryText}>
              {index === lastIndex ? t('intro.getStarted') : t('intro.next')}
              {index === lastIndex ? '' : ` ${isRTL ? '←' : '→'}`}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f7fbf8', flex: 1 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  topBarRTL: { flexDirection: 'row-reverse' },
  skipButton: { paddingHorizontal: 12, paddingVertical: 10 },
  skipText: { color: colors.emeraldDark, fontSize: 15, fontWeight: '800' },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  imageCard: { backgroundColor: colors.white, borderColor: '#d6e8dd', borderRadius: 28, borderWidth: 1, elevation: 5, height: '52%', overflow: 'hidden', shadowColor: '#0d5c36', shadowOffset: { height: 6, width: 0 }, shadowOpacity: 0.14, shadowRadius: 12, width: '100%' },
  image: { height: '100%', width: '100%' },
  title: { color: '#142033', fontSize: 26, fontWeight: '900', marginTop: 26 },
  description: { color: '#607066', fontSize: 15, lineHeight: 25, marginTop: 8, maxWidth: 540, paddingHorizontal: 14 },
  footer: { paddingBottom: 18, paddingHorizontal: 22 },
  dots: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  dot: { backgroundColor: '#c8d8cf', borderRadius: 5, height: 9, marginHorizontal: 4, width: 9 },
  activeDot: { backgroundColor: colors.emerald, width: 27 },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  actionsRTL: { flexDirection: 'row-reverse' },
  primaryButton: { alignItems: 'center', backgroundColor: colors.emerald, borderRadius: 18, elevation: 3, flex: 1, justifyContent: 'center', minHeight: 56, paddingHorizontal: 18 },
  primaryText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', borderColor: colors.emerald, borderRadius: 18, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 56, paddingHorizontal: 14 },
  secondaryText: { color: colors.emeraldDark, fontSize: 15, fontWeight: '800' },
  hiddenButton: { opacity: 0 },
});

export default IntroScreen;
