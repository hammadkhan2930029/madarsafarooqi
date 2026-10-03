import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  findNodeHandle,
} from 'react-native';

export const KeyboardScrollContext = createContext({
  onInputFocus: () => {},
});

const KeyboardAwareScrollView = forwardRef(({
  children,
  keyboardDismissMode = 'on-drag',
  keyboardShouldPersistTaps = 'handled',
  ...props
}, ref) => {
  const scrollRef = useRef(null);
  const focusedInputRef = useRef(null);
  const timerRef = useRef(null);

  useImperativeHandle(ref, () => scrollRef.current);

  const revealFocusedInput = useCallback(() => {
    const input = focusedInputRef.current;
    const scroll = scrollRef.current;
    const scrollNode = findNodeHandle(scroll);
    if (!input || !scroll || !scrollNode) return;

    input.measureLayout(
      scrollNode,
      (_left, top) => scroll.scrollTo({ animated: true, y: Math.max(0, top - 24) }),
      () => {},
    );
  }, []);

  const scheduleReveal = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(revealFocusedInput, Platform.OS === 'ios' ? 90 : 220);
  }, [revealFocusedInput]);

  const onInputFocus = useCallback(input => {
    focusedInputRef.current = input;
    scheduleReveal();
  }, [scheduleReveal]);

  useEffect(() => {
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(event, scheduleReveal);
    return () => {
      subscription.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleReveal]);

  const context = useMemo(() => ({ onInputFocus }), [onInputFocus]);

  return (
    <KeyboardScrollContext.Provider value={context}>
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardScrollContext.Provider>
  );
});

export default KeyboardAwareScrollView;
