import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import AppText from '../../Components/AppText';
import { useTranslation } from '../../localization/i18n';

const splashLogo = require('../../Assets/logos/splashLogo.png');

const SplashScreen = () => {
  const { t } = useTranslation();
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entranceAnimation = Animated.timing(entrance, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 850,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 850,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    entranceAnimation.start(() => pulseAnimation.start());
    return () => {
      entranceAnimation.stop();
      pulseAnimation.stop();
    };
  }, [entrance, pulse]);

  return (
    <View accessibilityLabel={t('dashboard.loading')} style={styles.container}>
      <View style={styles.glow} />
      <Animated.View
        style={[
          styles.logoShell,
          {
            opacity: entrance,
            transform: [
              {
                scale: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.82, 1],
                }),
              },
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Image resizeMode="contain" source={splashLogo} style={styles.logo} />
      </Animated.View>
      <Animated.View style={{ opacity: entrance }}>
        <AppText align="center" style={styles.title}>
          {t('auth.loginTitle')}
        </AppText>
        <AppText align="center" style={styles.loading}>
          {t('dashboard.loading')}
        </AppText>
      </Animated.View>
      <Animated.View
        style={[
          styles.loadingBar,
          {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 1],
            }),
            transform: [
              {
                scaleX: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.45, 1],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 28,
  },
  glow: {
    backgroundColor: '#eaf8ef',
    borderRadius: 210,
    height: 420,
    opacity: 0.8,
    position: 'absolute',
    width: 420,
  },
  loading: { color: '#687386', fontSize: 13, marginTop: 7 },
  loadingBar: {
    backgroundColor: '#18a34a',
    borderRadius: 4,
    height: 4,
    marginTop: 24,
    width: 88,
  },
  logo: { height: 174, width: 174 },
  logoShell: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 100,
    elevation: 8,
    height: 196,
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#0b5f2b',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    width: 196,
  },
  title: { color: '#142033', fontSize: 27, fontWeight: '900' },
});

export default SplashScreen;
