import React, { useEffect, useState } from 'react';

import LoginScreen from '../Screens/Auth/LoginScreen';
import SuperAdminDashboard from '../Screens/SuperAdmin/SuperAdminDashboard';
import TeacherDashboard from '../Screens/Teacher/TeacherDashboard';
import FirstLoginOnboardingScreen from '../Screens/Auth/FirstLoginOnboardingScreen';
import SplashScreen from '../Screens/Splash/SplashScreen';
import IntroScreen from '../Screens/Intro/IntroScreen';
import { useAuth } from '../context/AuthContext';
import {
  hasCompletedIntro,
  markIntroCompleted,
} from '../storage/introStorage';

const AppNavigator = () => {
  const { loading, user } = useAuth();
  const [minimumSplashComplete, setMinimumSplashComplete] = useState(false);
  const [introComplete, setIntroComplete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setMinimumSplashComplete(true), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    hasCompletedIntro()
      .then(completed => {
        if (mounted) setIntroComplete(completed);
      })
      .catch(() => {
        if (mounted) setIntroComplete(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const completeIntro = async () => {
    setIntroComplete(true);
    try {
      await markIntroCompleted();
    } catch {
      // Continue safely; a failed local write may show the intro next launch.
    }
  };

  if (loading || !minimumSplashComplete || introComplete === null) {
    return <SplashScreen />;
  }

  if (!introComplete) return <IntroScreen onComplete={completeIntro} />;

  if (!user) {
    return <LoginScreen />;
  }

  if (user.role === 'TEACHER') {
    if (user.onboarding_required && !user.onboarding_completed_at) {
      return <FirstLoginOnboardingScreen />;
    }
    return <TeacherDashboard user={user} />;
  }

  if (user.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard user={user} />;
  }

  return <LoginScreen />;
};

export default AppNavigator;
