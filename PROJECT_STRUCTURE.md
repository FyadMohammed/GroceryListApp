project-root/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
│
├── src/
│   ├── assets/              # Static files (images, icons, fonts)
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   └── InputField.tsx
│   │
│   ├── screens/             # App screens (UI + logic per page)
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── ProfileScreen.tsx
│   │
│   ├── navigation/          # React Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── index.ts
│   │
│   ├── context/             # Context providers (e.g., AuthContext)
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/               # Custom hooks (e.g., useAuth)
│   │   └── useAuth.ts
│   │
│   ├── services/            # API & storage services
│   │   ├── api.ts           # HTTP client setup (axios or fetch)
│   │   └── auth.ts          # login/register/logout API logic
│   │
│   ├── utils/               # Helpers and constants
│   │   ├── constants.ts
│   │   └── storage.ts       # AsyncStorage helper
│   │
│   └── types/               # TypeScript types and interfaces
│       └── index.d.ts
│
└── scripts/                 # Optional scripts (build, assets, etc.)
    └── setupEnv.js
