/**
 * Application Configuration
 * Centralizes environment variables and constants
 */

export const config = {
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  mlApiUrl: process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000/api/v1/ml',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',

  // Auth
  accessTokenKey: 'isl_access_token',
  refreshTokenKey: 'isl_refresh_token',
  tokenPrefix: 'Bearer',

  // Gamification
  maxHearts: 5,
  heartRegenerationMinutes: 240, // 4 hours
  dailyGoalXp: 20,
  streakFreezeGemsCost: 10,
  refillHeartsGemsCost: 5,

  // XP Rewards
  xpRewards: {
    lessonComplete: 10,
    quizCorrectAnswer: 2,
    gestureRecognized: 3,
    dailyGoalMet: 15,
    streakMaintain: 5,
    assignmentPerfect: 50,
  },

  // Level Thresholds
  levelThresholds: [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    1000,   // Level 5
    1750,   // Level 6
    2750,   // Level 7
    4000,   // Level 8
    5500,   // Level 9
    7500,   // Level 10
    10000,  // Level 11
    13000,  // Level 12
    16500,  // Level 13
    20500,  // Level 14
    25000,  // Level 15
    30000,  // Level 16
    35500,  // Level 17
    41500,  // Level 18
    48000,  // Level 19
    55000,  // Level 20
  ],

  // UI
  toastDuration: 3000,
  animationDuration: 300,
} as const;

export type Config = typeof config;
