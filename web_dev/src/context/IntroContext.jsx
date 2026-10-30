import React, { createContext, useContext, useState, useEffect } from 'react';
import { stopScroll, startScroll } from '../utils/animations';
import { hasIntroPlayed, setIntroPlayed } from '../utils/introState';

const IntroContext = createContext({
  introDone: false,
  setIntroDone: () => {},
  isIntroActive: true,
  markIntroSeen: () => {},
});

export function IntroProvider({ children }) {
  // On a fresh page load or browser reload, hasIntroPlayed() is false => intro will play
  // On client-side navigation within the SPA, hasIntroPlayed() is true => intro will NOT replay
  const [introDone, setIntroDone] = useState(() => hasIntroPlayed());
  const [isIntroActive, setIsIntroActive] = useState(() => !hasIntroPlayed());

  // Manage Lenis & body scroll lock while intro is playing
  useEffect(() => {
    if (isIntroActive) {
      stopScroll();
    } else {
      startScroll();
    }
  }, [isIntroActive]);

  const markIntroSeen = () => {
    setIntroPlayed(true);
    setIntroDone(true);
    setIsIntroActive(false);
    startScroll();

    // Remove intro-active class from <html> once intro completes
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('intro-active');
    }
  };

  return (
    <IntroContext.Provider value={{ introDone, setIntroDone, isIntroActive, markIntroSeen }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
