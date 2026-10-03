import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authApi from '../api/authApi';
import { setSessionInvalidHandler } from '../api/client';
import { normalizeRole } from '../Utils/roles';
import { env } from '../Config/env';

const AuthContext = createContext(null);

const mapUser = user => {
  const role = normalizeRole(user?.role);
  if (!user || !role) return null;
  return {
    ...user,
    role,
    status: String(user.status || '').toLowerCase(),
    uid: user.id,
    branch_id: user.branchId,
    class_id: user.classId,
    base_salary: user.baseSalary,
    ijara_frequency: String(user.ijaraFrequency || 'MONTHLY').toLowerCase(),
    weekly_ijara_amount: user.weeklyIjaraAmount,
    monthly_allowance: user.monthlyAllowance,
    attendance_allowance: user.attendanceAllowance,
    attendance_allowance_enabled: Boolean(user.attendanceAllowanceEnabled),
    conveyance_allowance: user.conveyanceAllowance,
    medical_allowance: user.medicalAllowance,
    working_days: user.workingDays || [],
    profile_image_url: user.profileImageUrl?.startsWith('http') ? user.profileImageUrl : user.profileImageUrl ? `${env.API_BASE_URL.replace(/\/api\/?$/, '')}${user.profileImageUrl}` : null,
    ijara_terms: user.ijaraTerms,
    ijara_terms_version: user.ijaraTermsVersion,
    ijara_accepted_at: user.ijaraAcceptedAt,
    ijara_conditions: user.ijaraConditions || [],
    onboarding_required: Boolean(user.onboardingRequired),
    onboarding_completed_at: user.onboardingCompletedAt,
    teacher_type: String(user.teacherType || 'TEACHER').toLowerCase(),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => setUser(null), []);

  useEffect(() => {
    setSessionInvalidHandler(clearSession);
    let mounted = true;
    (async () => {
      const tokens = await authApi.restoreTokens();
      if (!tokens) return;
      const profile = await authApi.getCurrentUser();
      const mapped = mapUser(profile);
      if (!mapped) throw new Error('INVALID_ROLE');
      if (mounted) setUser(mapped);
    })()
      .catch(() => authApi.logout().catch(() => {}))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
      setSessionInvalidHandler(null);
    };
  }, [clearSession]);

  const login = useCallback(async (loginId, password) => {
    const profile = mapUser(
      await authApi.login({ loginId: loginId.trim().toLowerCase(), password }),
    );
    if (!profile) {
      await authApi.logout();
      const error = new Error('INVALID_ROLE');
      error.response = { data: { error: { code: 'INVALID_ROLE' } } };
      throw error;
    }
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(async values => {
    await authApi.changePassword(values);
    setUser(null);
  }, []);
  const acceptIjaraTerms = useCallback(async () => {
    const profile = mapUser(await authApi.acceptIjaraTerms(user?.ijara_terms_version));
    setUser(profile);
    return profile;
  }, [user?.ijara_terms_version]);
  const completeOnboarding = useCallback(async values => {
    const profile = mapUser(await authApi.completeOnboarding(values));
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, changePassword, acceptIjaraTerms, completeOnboarding }),
    [user, loading, login, logout, changePassword, acceptIjaraTerms, completeOnboarding],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};
