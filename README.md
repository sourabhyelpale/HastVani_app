# ISL Learning Platform - Frontend

Next.js frontend for the ISL (Indian Sign Language) Learning Platform. Supports web and Android (via Capacitor).

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Real-time**: Socket.io-client
- **Mobile**: Capacitor (Android)

## Structure

```
app/                  # Next.js App Router pages
├── achievements/
├── admin/
├── alphabet/
├── alphabetid/
├── analytics/
├── classes/
├── dashboard/
├── forgot-password/
├── leaderboard/
├── lessons/[id]/
├── login/
├── modules/[id]/
├── practice/
├── profile/
├── register/
├── teacher/
└── layout.tsx

components/
├── AlphabetCard.tsx
├── BottomTabNavigator.tsx   # Hidden on /lessons/* and /practice
├── CustomHeader.tsx
├── LessonCard.tsx
├── auth/                    # ProtectedRoute, RoleGuard, LoginForm, RegisterForm
└── ui/                      # Radix-based UI primitives

lib/
├── api.ts            # Axios client with all API methods
├── config.ts         # Centralized config (routes, roles, theme, gamification)
├── theme.ts
└── utils.ts

store/
├── authStore.ts
├── lessonStore.ts
├── notificationStore.ts
├── uiStore.ts
└── userStore.ts

types/                # TypeScript types
```

## Running

```bash
# Install dependencies
npm install

# Development (web)
npm run dev           # Runs on :3000

# Build for production
npm run build
npm start

# Android (via Capacitor)
npx cap sync android
npx cap open android
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_ML_API_URL=http://localhost:8000/api/v1/ml
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_ML_WS_URL=ws://localhost:8000/api/v1/ml
```

See `app/.env` for the full list of configuration variables.

## Key Pages

| Route | Role | Description |
|-------|------|-------------|
| `/dashboard` | All | Main dashboard with stats |
| `/modules/[id]` | Student | Module detail with lesson list (all unlocked) |
| `/lessons/[id]` | Student | Lesson player (video, quiz, gesture) |
| `/practice` | Student | Gesture practice with camera |
| `/alphabet` | Student | ISL alphabet reference |
| `/leaderboard` | All | Global + class leaderboard |
| `/achievements` | All | Achievement gallery |
| `/classes` | Student/Teacher | Class management |
| `/teacher` | Teacher | Teacher dashboard |
| `/admin` | Admin | Admin panel |

## Notes

- `BottomTabNavigator` is hidden on `/lessons/*` and `/practice` routes since these have their own navigation.
- All lessons in a module are unlocked (no sequential locking).
- Video blocks use `playsInline` and show a fallback message when `mediaUrl` is missing.
- Config is centralized in `lib/config.ts` — update routes, roles, theme, and gamification constants there.
