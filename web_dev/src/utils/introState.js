// In-memory module state for SPA runtime
// Naturally resets on full page reload / fresh browser load, persists across client-side route changes
let introPlayed = false;

export const hasIntroPlayed = () => introPlayed;

export const setIntroPlayed = (played = true) => {
  introPlayed = played;
};

export const resetIntroPlayed = () => {
  introPlayed = false;
};

