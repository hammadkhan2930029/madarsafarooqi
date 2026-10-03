import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getRowDirection } from '../localization/direction';
import { useTranslation } from '../localization/i18n';
import colors from '../theme/colors';
import AppText from './AppText';

const navbarLogo = require('../Assets/logos/navbarlogo.png');

const TAB_ICON = {
  attendanceHistory: 'history',
  dashboard: 'view-dashboard-outline',
  attendance: 'calendar-check-outline',
  branches: 'source-branch',
  changePassword: 'lock-reset',
  checkInOut: 'clock-check-outline',
  classes: 'view-grid-outline',
  holidays: 'calendar-star',
  inspections: 'clipboard-check-outline',
  leaveHistory: 'calendar-clock-outline',
  reports: 'file-chart-outline',
  leaves: 'calendar-clock-outline',
  leaveRequest: 'calendar-clock-outline',
  logout: 'logout',
  mySalary: 'cash-multiple',
  myStudents: 'account-multiple-outline',
  notifications: 'bell-outline',
  salaries: 'cash-multiple',
  settings: 'cog-outline',
  shifts: 'clock-outline',
  students: 'school-outline',
  teachers: 'account-group-outline',
  myProfile: 'account-circle-outline',
};

const AppDrawerNavigation = ({ activeKey, items }) => {
  const { isRTL, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const drawerSlide = useRef(new Animated.Value(0)).current;
  const activeItem = useMemo(
    () => items.find(item => item.key === activeKey) || items[0],
    [activeKey, items],
  );
  const identityLabel = useMemo(
    () => items.find(item => item.identityLabel)?.identityLabel,
    [items],
  );
  const selectItem = item => {
    setOpen(false);
    item.onPress?.();
  };
  const openProfile = () => {
    const customProfileAction = items.find(
      item => typeof item.profileOnPress === 'function',
    );
    if (customProfileAction) {
      customProfileAction.profileOnPress();
      return;
    }
    items.find(item => item.key === 'myProfile')?.onPress?.();
  };
  const bottomItems = useMemo(() => {
    const byKey = key => items.find(item => item.key === key);
    const isTeacherNavigation = Boolean(byKey('checkInOut'));
    if (isTeacherNavigation) {
      return [
        byKey('dashboard'),
        byKey('checkInOut'),
        byKey('attendanceHistory'),
        byKey('leaveRequest'),
        byKey('myProfile'),
      ].filter(Boolean);
    }
    return [
      byKey('dashboard'),
      byKey('attendance') || byKey('checkInOut'),
      byKey('reports'),
      byKey('leaves') || byKey('leaveRequest'),
      byKey('settings') || byKey('myProfile'),
    ].filter(Boolean);
  }, [items]);
  const drawerTranslateX = drawerSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [isRTL ? 420 : -420, 0],
  });

  useEffect(() => {
    Animated.timing(drawerSlide, {
      duration: 240,
      toValue: open ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [drawerSlide, open]);

  return (
    <>
      <View style={styles.navbar}>
        {/* Left Menu */}
        <TouchableOpacity
          accessibilityLabel={t('navigation.openMenu')}
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={styles.menuButton}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            color={colors.emeraldDark}
            name="menu"
            size={26}
          />
        </TouchableOpacity>

        {/* Center Logo + Name */}
        <View pointerEvents="none" style={styles.navCenter}>
          <View style={styles.navLogoShell}>
            <Image
              resizeMode="contain"
              source={navbarLogo}
              style={styles.logo}
            />
          </View>

          <AppText
            align="center"
            numberOfLines={1}
            style={styles.appName}
          >
            {t('common.appName')}
          </AppText>


        </View>

        {/* Right Actions */}
        <View style={styles.navActions}>


          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openProfile}
            style={styles.avatarShell}
          >
            <MaterialCommunityIcons
              color={colors.emeraldDark}
              name="account-outline"
              size={26}
            />
          </TouchableOpacity>
        </View>
      </View>
     
      <View style={styles.bottomNavigation}>
        <View style={[styles.bottomTabRow, { flexDirection: getRowDirection(isRTL) }]}>
          {bottomItems.map(item => {
            const active = item.key === activeKey;
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={item.key}
                onPress={() => item.onPress?.()}
                style={styles.bottomTab}
              >
                <MaterialCommunityIcons
                  color={active ? colors.emerald : colors.muted}
                  name={TAB_ICON[item.key] || 'circle-outline'}
                  size={23}
                />
                <AppText numberOfLines={1} style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {item.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
        transparent
        visible={open}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            accessibilityLabel={t('navigation.closeMenu')}
            accessibilityRole="button"
            activeOpacity={1}
            onPress={() => setOpen(false)}
            style={styles.backdrop}
          />
          <Animated.View
            style={[
              styles.drawer,
              isRTL ? styles.drawerRight : styles.drawerLeft,
              { transform: [{ translateX: drawerTranslateX }] },
            ]}
          >
            <View
              style={[
                styles.drawerHeader,
                { flexDirection: getRowDirection(isRTL) },
              ]}
            >
              <View style={styles.drawerLogoShell}>
                <Image
                  resizeMode="contain"
                  source={navbarLogo}
                  style={styles.drawerLogo}
                />
              </View>
              <View style={styles.drawerBrand}>
                <AppText style={styles.drawerTitle}>
                  {t('common.appName')}
                </AppText>
                <AppText style={styles.drawerSubtitle}>
                  {identityLabel || t('navigation.menu')}
                </AppText>
              </View>
              <TouchableOpacity
                accessibilityLabel={t('navigation.closeMenu')}
                accessibilityRole="button"
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons color={colors.white} name="close" size={27} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.drawerContent}
              showsVerticalScrollIndicator={false}
            >
              {items.map(item => {
                const active = activeKey === item.key;
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: Boolean(item.disabled),
                      selected: active,
                    }}
                    disabled={item.disabled}
                    key={item.key}
                    onPress={() => selectItem(item)}
                    style={[
                      styles.drawerItem,
                      active && styles.activeItem,
                      item.danger && styles.dangerItem,
                      item.disabled && styles.disabledItem,
                    ]}
                  >
                    <View
                      style={[
                        styles.itemContent,
                        { flexDirection: getRowDirection(isRTL) },
                      ]}
                    >
                      <View
                        style={[
                          styles.drawerItemIcon,
                          active && styles.activeDrawerItemIcon,
                          item.danger && styles.dangerDrawerItemIcon,
                        ]}
                      >
                        <MaterialCommunityIcons
                          color={item.danger ? colors.danger : active ? colors.white : colors.emeraldDark}
                          name={TAB_ICON[item.key] || 'circle-outline'}
                          size={21}
                        />
                      </View>
                      <AppText
                        style={[
                          styles.itemLabel,
                          active && styles.activeLabel,
                          item.danger && styles.dangerLabel,
                          item.disabled && styles.disabledLabel,
                        ]}
                      >
                        {item.label}
                      </AppText>
                      <MaterialCommunityIcons
                        color={active ? colors.white : colors.muted}
                        name={isRTL ? 'chevron-left' : 'chevron-right'}
                        size={22}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  activeIndicator: { backgroundColor: colors.emerald, },
  activeItem: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
    elevation: 5,
    shadowOpacity: 0.16,
  },
  activeLabel: { color: colors.white },
  bottomNavigation: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    elevation: 10,
    height: 68,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: colors.shadow,
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    zIndex: 50,
  },
  bottomTabRow: { alignItems: 'center', flex: 1, justifyContent: 'space-around', width: '100%' },
  bottomTab: { alignItems: 'center', flex: 1, height: 68, justifyContent: 'center' },
  tabLabel: { color: colors.muted, fontSize: 8, fontWeight: '700', marginTop: 2, maxWidth: 72, textAlign: 'center' },
  tabLabelActive: { color: colors.emeraldDark, fontWeight: '900' },
  appName: { color: colors.emeraldDark, fontSize: 18, fontWeight: '900' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,31,16,0.58)',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  dangerIndicator: { backgroundColor: colors.danger },
  dangerItem: { marginTop: 10 },
  dangerLabel: { color: colors.danger },
  disabledItem: { opacity: 0.5 },
  disabledLabel: { color: '#8D9B92' },
  drawer: {
    backgroundColor: colors.white,
    bottom: 0,
    elevation: 22,
    maxWidth: 390,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    top: 0,
    width: '86%',
  },
  drawerBrand: { flex: 1 },
  drawerContent: { padding: 18, paddingBottom: 32 },
  drawerHeader: {
    alignItems: 'center',
    backgroundColor: colors.emeraldDeep,
    gap: 13,
    minHeight: 150,
    padding: 22,
    paddingTop: 30,
  },
  drawerLeft: { borderBottomRightRadius: 30, borderTopRightRadius: 30, left: 0 },
  drawerRight: { borderBottomLeftRadius: 30, borderTopLeftRadius: 30, right: 0 },
  drawerLogo: { height: 58, width: 58 },
  drawerLogoShell: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 42,
    borderWidth: 0,
    elevation: 5,
    height: 78,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    width: 78,
  },
  drawerSubtitle: { color: 'rgba(255,255,255,0.77)', fontSize: 12, marginTop: 4 },
  drawerTitle: { color: colors.white, fontSize: 20, fontWeight: '900' },
  drawerItem: {
    borderColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.shadow,
    shadowOffset: { height: 2, width: 0 },
    shadowRadius: 4,
  },
  drawerItemIcon: {
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  activeDrawerItemIcon: { backgroundColor: 'rgba(255,255,255,0.18)' },
  dangerDrawerItemIcon: { backgroundColor: '#FDE8E8' },
  itemContent: { alignItems: 'center', gap: 12 },
  itemLabel: { color: '#32483A', flex: 1, fontSize: 15, fontWeight: '700' },
  logo: { height: 48, width: 48 },
  menuButton: {
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    borderRadius: 16,
    borderWidth: 0,
    elevation: 5,
    height: 46,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    width: 46,
  },
  navActions: { alignItems: 'center', gap: 10 },
  navActionIcon: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderRadius: 16, elevation: 5, height: 46, justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.12, shadowRadius: 8, width: 46 },
  avatarShell: { alignItems: 'center', backgroundColor: '#D8F8E3', borderRadius: 16, elevation: 5, height: 46, justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.12, shadowRadius: 8, width: 46 },

  
  navbar: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    elevation: 7,
    height: 100,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    shadowColor: colors.shadow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 20,
  },
  // The drawer Modal needs a full-screen parent; without this its absolute
  // drawer panel has no visible layout area.
  overlay: { flex: 1 },
  navCenter: { alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  screenTitle: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 3 },
  navLogoShell: {
    height: 58,
    width: 58,
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    borderRadius: 16,
    elevation: 5,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  navbarLogo: { height: 42, width: 42 },
  navActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,

  },
  menuButton: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderRadius: 16, elevation: 5, height: 46, justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.12, shadowRadius: 8, width: 38 },
 
  avatarShell: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderRadius: 16, elevation: 5, height: 46, justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.12, shadowRadius: 8, width: 38 },

});

export default AppDrawerNavigation;
