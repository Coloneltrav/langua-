// Transient UI state (current route, in-flight quiz, tutor chat history…).
// Deliberately NOT persisted — this is view state, distinct from the
// learning progress in state/store.js which is saved to the backend.
export const uiState = {
  route: 'home',
  currentWord: null,
  detailWord: null,
  revealAnswer: false,
  overrideCap: false,
  lastAutoPlayed: null,

  quizTarget: null,
  quizOptions: [],
  quizChoice: null,

  activeCapsule: null,
  generatedCapsules: [], // session-only, not fact-checked the way hand-authored ones are
  capsuleQuizChoice: null,
  capsuleGenBusy: false,

  tutorHistory: [], // [{role:'user'|'assistant', text, readiness?}]
  tutorBusy: false,
};
