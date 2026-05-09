# LangoPulse Mock API Data

This document describes the JSON mock data structure for building the LangoPulse API, with complete data examples.

## Table of Contents

- [Onboarding](#onboarding)
- [Home](#home)
- [Daily Challenge](#daily-challenge)
- [Tutor](#tutor)
- [Profile](#profile)
- [Grammar](#grammar)
- [Lesson Results](#lesson-results)
- [Review Mistakes](#review-mistakes)
- [Settings](#settings)
- [Community](#community)
- [Next.js API Implementation](#nextjs-api-implementation)

---

## Onboarding

**File**: `onboarding.json`

Used for initial language and goal selection during signup.

| Field | Type | Description |
|-------|------|-------------|
| `availableLanguages` | `Language[]` | List of languages user can learn |
| `goalOptions` | `GoalOption[]` | Daily time commitment options |

### Language

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (e.g., "spanish") |
| `label` | `string` | Display name (e.g., "Spanish") |
| `native` | `string` | Native name (e.g., "Español") |
| `icon` | `string` | MaterialCommunityIcons name |
| `iconColor` | `string` | Hex color for icon |
| `isFeatured` | `boolean` | Featured language highlighted |
| `corner` | `"tl" \| "tr" \| "bl" \| "br" \| "none"` | Corner badge position |

### GoalOption

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display label |
| `description` | `string` | Short description |
| `minutesPerDay` | `number` | Minutes per day commitment |
| `icon` | `string` | MaterialCommunityIcons name |
| `isRecommended` | `boolean` | Recommended option |

### Example Data

```json
{
  "status":200,
  "error":"none"
  "availableLanguages": [
    {
      "id": "french",
      "label": "French",
      "native": "Français",
      "icon": "silverware-fork-knife",
      "iconColor": "#785179",
      "isFeatured": false,
      "corner": "tl"
    },
    {
      "id": "spanish",
      "label": "Spanish",
      "native": "Español",
      "icon": "white-balance-sunny",
      "iconColor": "#3f6900",
      "isFeatured": true,
      "corner": "none"
    },
    {
      "id": "arabic",
      "label": "Arabic",
      "native": "العربية",
      "icon": "domain",
      "iconColor": "#006e2f",
      "isFeatured": false,
      "corner": "none"
    },
    {
      "id": "japanese",
      "label": "Japanese",
      "native": "日本語",
      "icon": "flower",
      "iconColor": "#ba1a1a",
      "isFeatured": false,
      "corner": "bl"
    }
  ],
  "goalOptions": [
    {
      "id": "casual",
      "label": "Casual",
      "description": "5 mins / day",
      "minutesPerDay": 5,
      "icon": "coffee",
      "isRecommended": false
    },
    {
      "id": "regular",
      "label": "Regular",
      "description": "15 mins / day",
      "minutesPerDay": 15,
      "icon": "lightning-bolt",
      "isRecommended": true
    },
    {
      "id": "intense",
      "label": "Intense",
      "description": "30 mins / day",
      "minutesPerDay": 30,
      "icon": "dumbbell",
      "isRecommended": false
    }
  ]
}
```

---

## Home

**File**: `home.json`

Home screen data showing user progress and daily challenge.

| Field | Type | Description |
|-------|------|-------------|
| `momentum` | `Momentum` | Current streak info |
| `dailyChallenge` | `DailyChallenge` | Today's featured challenge |
| `weeklyStats` | `WeeklyStats` | Weekly progress |
| `leaderboard` | `LeaderboardEntry[]` | Top users ranking |
| `leagueLabel` | `string` | Current league name |

### Momentum

| Field | Type | Description |
|-------|------|-------------|
| `userName` | `string` | User's display name |
| `streakDays` | `number` | Consecutive days |
| `streakLabel` | `string` | Streak status label |
| `dailyGoalPercent` | `number` | Daily goal completion % |

### DailyChallenge

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Challenge identifier |
| `title` | `string` | Challenge title |
| `description` | `string` | Challenge description |
| `isNew` | `boolean` | New challenge indicator |

### WeeklyStats

| Field | Type | Description |
|-------|------|-------------|
| `proficiencyPercent` | `number` | Fluency score |
| `label` | `string` | Status message |

### LeaderboardEntry

| Field | Type | Description |
|-------|------|-------------|
| `rank` | `number` | Position (1-based) |
| `name` | `string` | User name |
| `badge` | `string` | User badge/title |
| `xp` | `number` | Total XP |
| `isCurrentUser` | `boolean` | Is current user |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "momentum": {
    "userName": "Julian",
    "streakDays": 12,
    "streakLabel": "Unstoppable",
    "dailyGoalPercent": 85
  },
  "dailyChallenge": {
    "id": "challenge-001",
    "title": "The Night Market",
    "description": "Master conversational nuances in a bustling marketplace.",
    "isNew": true
  },
  "weeklyStats": {
    "proficiencyPercent": 72,
    "label": "Fluency is peaking."
  },
  "leaderboard": [
    { "rank": 1, "name": "Alex Rivera", "badge": "Master Polyglot", "xp": 14290, "isCurrentUser": false },
    { "rank": 2, "name": "Julian", "badge": "Rising Star", "xp": 12840, "isCurrentUser": true },
    { "rank": 3, "name": "Sarah Chen", "badge": "Grammar Guru", "xp": 11900, "isCurrentUser": false }
  ],
  "leagueLabel": "Diamond League · Season 4"
}
```

---

## Daily Challenge

**File**: `daily.json`

Daily exercise/lesson content with flip card interaction.

| Field | Type | Description |
|-------|------|-------------|
| `progress` | `ExerciseProgress` | Current session progress |
| `exercise` | `Exercise` | Exercise content |

### ExerciseProgress

| Field | Type | Description |
|-------|------|-------------|
| `progressPercent` | `number` | Overall completion % |
| `hearts` | `number` | Lives remaining (1-5) |
| `xpEarned` | `number` | XP earned in session |

### Exercise

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Exercise identifier |
| `xpReward` | `number` | XP for completion |
| `masteryLevel` | `number` | Difficulty level (1-5) |
| `flipCard` | `FlipCard` | Word to learn |
| `choices` | `Choice[]` | Answer options |
| `correctChoiceId` | `string` | ID of correct answer |
| `aiFeedbackMessage` | `string` | Feedback text |

### FlipCard

| Field | Type | Description |
|-------|------|-------------|
| `wordInTargetLanguage` | `string` | Word in learning language |
| `pronunciation` | `string` | Phonetic pronunciation |
| `wordInNativeLanguage` | `string` | Translation |
| `definition` | `string` | Word definition |

### Choice

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique option ID |
| `emoji` | `string` | Emoji representation |
| `label` | `string` | Option text |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "progress": {
    "progressPercent": 65,
    "hearts": 5,
    "xpEarned": 420
  },
  "exercise": {
    "id": "exercise-001",
    "xpReward": 15,
    "masteryLevel": 2,
    "flipCard": {
      "wordInTargetLanguage": "Blij",
      "pronunciation": "/blɛi/",
      "wordInNativeLanguage": "Happy",
      "definition": "Common adjective for feeling joy or satisfaction."
    },
    "choices": [
      { "id": "a", "emoji": "😊", "label": "Happy" },
      { "id": "b", "emoji": "😢", "label": "Sad" },
      { "id": "c", "emoji": "😲", "label": "Surprised" },
      { "id": "d", "emoji": "😡", "label": "Angry" }
    ],
    "correctChoiceId": "a",
    "aiFeedbackMessage": "Great pronunciation! Now, can you tap the matching facial expression?"
  }
}
```

---

## Tutor

**File**: `tutor.json`

AI conversation tutor session with message history.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Session identifier |
| `title` | `string` | Session topic |
| `language` | `string` | Learning language |
| `tutorName` | `string` | AI tutor name |
| `messages` | `TutorMessage[]` | Conversation history |

### TutorMessage

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Message identifier |
| `role` | `"ai" \| "user"` | Message sender |
| `text` | `string` | Message content |
| `translation` | `string \| null` | English translation |
| `grammarTip` | `string \| null` | Grammar tip |
| `createdAt` | `string` | ISO timestamp |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "id": "session-001",
  "title": "Practice: Ordering Coffee",
  "language": "Spanish",
  "tutorName": "Lingo AI",
  "messages": [
    {
      "id": "1",
      "role": "ai",
      "text": "¡Hola! ¿Qué te gustaría ordenar hoy? Tenemos café recién hecho y pastelería deliciosa.",
      "translation": "Hi! What would you like to order today? We have freshly brewed coffee and delicious pastries.",
      "grammarTip": null,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "2",
      "role": "user",
      "text": "Quisiera un café con leche y un croissant, por favor.",
      "translation": null,
      "grammarTip": "Perfect sentence! You used \"quisiera\" (I would like) which is very polite for ordering.",
      "createdAt": "2024-01-15T10:01:00.000Z"
    },
    {
      "id": "3",
      "role": "ai",
      "text": "Excelente elección. ¿Deseas el café grande o mediano?",
      "translation": "Excellent choice. Do you want the coffee large or medium?",
      "grammarTip": null,
      "createdAt": "2024-01-15T10:02:00.000Z"
    }
  ]
}
```

---

## Profile

**File**: `profile.json`

User profile with stats, achievements, and activity heatmap.

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User` | User info |
| `badge` | `string` | Current badge title |
| `xpPoints` | `number` | Total XP |
| `globalRank` | `number` | World ranking |
| `fluencyBreakdown` | `FluencyItem[]` | Per-language fluency |
| `pronunciationAccuracyPercent` | `number` | Speech accuracy |
| `pronunciationTrendPercent` | `number` | Trend (+/-) |
| `activityHeatmap` | `string[]` | 28-day activity colors |
| `achievements` | `Achievement[]` | Unlocked achievements |

### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID |
| `email` | `string` | Email address |
| `name` | `string` | Display name |
| `avatarUrl` | `string \| null` | Profile picture URL |
| `nativeLanguage` | `string` | Native language |
| `learningLanguage` | `string` | Currently learning |
| `dailyGoalMinutes` | `number` | Daily goal |
| `streakDays` | `number` | Current streak |
| `createdAt` | `string` | ISO signup date |

### FluencyItem

| Field | Type | Description |
|-------|------|-------------|
| `language` | `string` | Language name |
| `percent` | `number` | Fluency % |

### Achievement

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Achievement ID |
| `icon` | `string` | MaterialCommunityIcons name |
| `iconBg` | `string` | Background color |
| `iconColor` | `string` | Icon color |
| `title` | `string` | Achievement title |
| `description` | `string` | Description |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "email": "julian@langopulse.dev",
    "name": "Julian",
    "avatarUrl": null,
    "nativeLanguage": "English",
    "learningLanguage": "Spanish",
    "dailyGoalMinutes": 20,
    "streakDays": 732,
    "createdAt": "2022-01-01T00:00:00.000Z"
  },
  "badge": "Master Polyglot",
  "xpPoints": 2400,
  "globalRank": 12,
  "fluencyBreakdown": [
    { "language": "Spanish", "percent": 72 },
    { "language": "Japanese", "percent": 45 }
  ],
  "pronunciationAccuracyPercent": 94,
  "pronunciationTrendPercent": 2,
  "activityHeatmap": [
    "#aef759", "#3f6a00", "#94da3f", "#e2e2e2", "#3f6a00", "#3f6a00", "#aef759",
    "#3f6a00", "#aef759", "#aef759", "#3f6a00", "#e2e2e2", "#aef759", "#3f6a00",
    "#aef759", "#3f6a00", "#aef759", "#3f6a00", "#3f6a00", "#aef759", "#3f6a00",
    "#aef759", "#e2e2e2", "#3f6a00", "#aef759", "#3f6a00", "#3f6a00", "#aef759"
  ],
  "achievements": [
    {
      "id": "ach-001",
      "icon": "weather-sunny",
      "iconBg": "#ffd6fd",
      "iconColor": "#785179",
      "title": "Early Bird",
      "description": "50 morning lessons"
    },
    {
      "id": "ach-002",
      "icon": "lightning-bolt",
      "iconBg": "#aef759",
      "iconColor": "#3f6a00",
      "title": "Sprint Master",
      "description": "7-day perfect streak"
    },
    {
      "id": "ach-003",
      "icon": "book-education",
      "iconBg": "#6bff8f",
      "iconColor": "#006e2f",
      "title": "Grammar Guru",
      "description": "Zero errors in quiz"
    }
  ]
}
```

---

## Grammar

### Grammar Detail

**File**: `grammar-detail.json`

Grammar rule explanation with quiz.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Grammar ID |
| `title` | `string` | Rule title |
| `subtitle` | `string` | Short description |
| `category` | `string` | Category name |
| `genderRules` | `GrammarRule[]` | Gender rules |
| `numberRules` | `GrammarRule[]` | Number rules |
| `examples` | `Example[]` | Usage examples |
| `quiz` | `Quiz` | Practice quiz |

### GrammarRule

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Rule name |
| `suffix` | `string` | Word ending |
| `example` | `string` | Example word |

### Example

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Example ID |
| `phrase` | `string` | Phrase in target language |
| `translation` | `string` | English translation |
| `agreementLabel` | `string` | Grammar category |
| `note` | `string \| null` | Additional note |

### Quiz

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | `string` | Fill-in-blank prompt |
| `options` | `string[]` | Answer choices |
| `correctAnswer` | `string` | Correct option |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "id": "gd-001",
  "title": "Noun-Adjective Agreement",
  "subtitle": "Matching gender and number for perfect sentences.",
  "category": "Grammar Mastery",
  "genderRules": [
    { "label": "Masculine", "suffix": "-o", "example": "El libro nuevo" },
    { "label": "Feminine", "suffix": "-a", "example": "La casa nueva" }
  ],
  "numberRules": [
    { "label": "Singular", "suffix": "", "example": "The base form of the adjective." },
    { "label": "Plural", "suffix": "-s / -es", "example": "Add -s (vowels) or -es (consonants)." }
  ],
  "examples": [
    { "id": "ex-001", "phrase": "El gato negro", "translation": "The black cat", "agreementLabel": "Masculine / Singular", "note": null },
    { "id": "ex-002", "phrase": "Un hombre inteligente", "translation": "A smart man", "agreementLabel": "Gender Neutral", "note": "Adjectives ending in -e are often gender neutral." },
    { "id": "ex-003", "phrase": "Las casas blancas", "translation": "The white houses", "agreementLabel": "Feminine / Plural", "note": null }
  ],
  "quiz": {
    "prompt": "Los libros ___ (pequeño)",
    "options": ["pequeño", "pequeños", "pequeña", "pequeñas"],
    "correctAnswer": "pequeños"
  }
}
```

### Grammar History

**File**: `grammar-history.json`

Grammar mastery progress and timeline.

| Field | Type | Description |
|-------|------|-------------|
| `masteryPercent` | `number` | Overall mastery % |
| `outperformedPercent` | `number` | Compared to avg users |
| `needsReview` | `ReviewItem[]` | Topics needing review |
| `timeline` | `TimelineEntry[]` | Learning history |

### ReviewItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Item ID |
| `icon` | `string` | MaterialCommunityIcons name |
| `title` | `string` | Topic title |
| `description` | `string` | Issue description |
| `isUrgent` | `boolean` | Immediate review needed |

### TimelineEntry

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Entry ID |
| `score` | `number` | Quiz score % |
| `title` | `string` | Topic title |
| `date` | `string` | Formatted date |
| `description` | `string` | Summary |
| `status` | `"Completed" \| "Incomplete"` | Completion status |
| `level` | `string` | Difficulty level |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "masteryPercent": 68,
  "outperformedPercent": 74,
  "needsReview": [
    { "id": "nr-001", "icon": "alert", "title": "Ser vs. Estar", "description": "Confused in 12/20 recent exercises. Review temporary vs. permanent states.", "isUrgent": true },
    { "id": "nr-002", "icon": "book-education", "title": "Noun-Adjective Agreement", "description": "Gender matching errors detected in complex sentences.", "isUrgent": false }
  ],
  "timeline": [
    { "id": "tl-001", "score": 92, "title": "Present Tense", "date": "Oct 24, 2023", "description": "Mastered regular -ar, -er, and -ir verb conjugations with high accuracy.", "status": "Completed", "level": "Advanced Level" },
    { "id": "tl-002", "score": 45, "title": "Irregular Verbs", "date": "Oct 21, 2023", "description": "Significant struggle with stem-changing verbs like 'querer' and 'poder'.", "status": "Incomplete", "level": "Intermediate Level" },
    { "id": "tl-003", "score": 78, "title": "Direct Object Pronouns", "date": "Oct 18, 2023", "description": "Understanding the placement of 'lo', 'la', 'los', 'las' in various sentence structures.", "status": "Completed", "level": "Beginner II" }
  ]
}
```

---

## Lesson Results

**File**: `lesson-results.json`

Post-lesson summary screen.

| Field | Type | Description |
|-------|------|-------------|
| `lessonId` | `string` | Completed lesson ID |
| `userName` | `string` | User's name |
| `accuracyPercent` | `number` | Correct answers % |
| `xpEarned` | `number` | XP awarded |
| `timeTakenSeconds` | `number` | Duration |
| `streakDays` | `number` | Current streak |
| `outperformedPercent` | `number` | vs other users |
| `expertTip` | `string` | AI feedback tip |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "lessonId": "lesson-001",
  "userName": "Julian",
  "accuracyPercent": 92,
  "xpEarned": 25,
  "timeTakenSeconds": 342,
  "streakDays": 12,
  "outperformedPercent": 88,
  "expertTip": "You're getting better at past-tense verbs! Focus on 'ir' irregulars next time."
}
```

---

## Review Mistakes

**File**: `review-mistakes.json`

Post-lesson error review with corrections.

| Field | Type | Description |
|-------|------|-------------|
| `lessonId` | `string` | Lesson ID |
| `totalMistakes` | `number` | Error count |
| `mistakes` | `Mistake[]` | Error details |

### Mistake

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Mistake ID |
| `type` | `string` | Error category |
| `prompt` | `string` | Question prompt |
| `yourAnswer` | `string` | User's answer |
| `correctAnswer` | `string` | Correct answer |
| `tip` | `Tip` | Correction tip |

### Tip

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Tip title |
| `body` | `string` | Explanation |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "lessonId": "lesson-001",
  "totalMistakes": 5,
  "mistakes": [
    {
      "id": "m-001",
      "type": "Verb Conjugation",
      "prompt": "Yo ___ (comer) pan.",
      "yourAnswer": "comemos",
      "correctAnswer": "como",
      "tip": { "title": "The \"Yo\" Rule", "body": "'Yo' uses the -o ending for -er verbs in the present tense." }
    },
    {
      "id": "m-002",
      "type": "Gender Agreement",
      "prompt": "The black cat",
      "yourAnswer": "El gato negra",
      "correctAnswer": "El gato negro",
      "tip": { "title": "Noun-Adjective Harmony", "body": "Adjectives must match the gender of the noun. Since gato is masculine, use negro." }
    },
    {
      "id": "m-003",
      "type": "Ser vs. Estar",
      "prompt": "She ___ (to be) a doctor.",
      "yourAnswer": "está médica",
      "correctAnswer": "es médica",
      "tip": { "title": "Permanent States Use Ser", "body": "Professions and identities are permanent traits — always use 'ser', not 'estar'." }
    }
  ]
}
```

---

## Settings

**File**: `settings.json`

User preferences and app settings.

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User` | Basic user info |
| `level` | `number` | User level |
| `levelLabel` | `string` | Level title |
| `levelProgressPercent` | `number` | Progress to next level |
| `isPro` | `boolean` | Pro subscription |
| `learning` | `LearningSettings` | Learning config |
| `notifications` | `NotificationSettings` | Notification prefs |
| `app` | `AppSettings` | App preferences |

### LearningSettings

| Field | Type | Description |
|-------|------|-------------|
| `dailyGoalMinutes` | `number` | Daily goal |
| `targetLanguage` | `string` | Target language |
| `tutorVoice` | `string` | AI voice preference |

### NotificationSettings

| Field | Type | Description |
|-------|------|-------------|
| `lessonReminders` | `boolean` | Lesson reminders |
| `streakAlerts` | `boolean` | Streak notifications |
| `communityMessages` | `boolean` | Community messages |

### AppSettings

| Field | Type | Description |
|-------|------|-------------|
| `darkMode` | `boolean` | Dark mode toggle |
| `appLanguage` | `string` | App UI language |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Julian",
    "email": "julian@langopulse.dev",
    "avatarUrl": null
  },
  "level": 24,
  "levelLabel": "Polyglot in Training",
  "levelProgressPercent": 72,
  "isPro": true,
  "learning": {
    "dailyGoalMinutes": 20,
    "targetLanguage": "Spanish",
    "tutorVoice": "Mateo (Natural)"
  },
  "notifications": {
    "lessonReminders": true,
    "streakAlerts": true,
    "communityMessages": false
  },
  "app": {
    "darkMode": false,
    "appLanguage": "English (US)"
  }
}
```

---

## Community

**File**: `community.json`

Community hub with challenges and groups.

| Field | Type | Description |
|-------|------|-------------|
| `globalChallenge` | `GlobalChallenge` | Active challenge |
| `weeklyLeaderboard` | `LeaderboardEntry[]` | Top learners |
| `studyGroups` | `StudyGroup[]` | Available groups |

### GlobalChallenge

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Challenge ID |
| `title` | `string` | Challenge title |
| `description` | `string` | Description |
| `isActive` | `boolean` | Currently running |
| `progressPercent` | `number` | User progress % |
| `participantCount` | `number` | Total participants |

### StudyGroup

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Group ID |
| `icon` | `string` | MaterialCommunityIcons name |
| `iconBg` | `string` | Background color |
| `iconColor` | `string` | Icon color |
| `title` | `string` | Group name |
| `description` | `string` | Description |
| `memberCount` | `number` | Current members |

### Example Data

```json
{
  "status":200,
  "error":"none",
  "globalChallenge": {
    "id": "gc-001",
    "title": "7-Day Vocabulary Sprint",
    "description": "Master 100 new words in a week.",
    "isActive": true,
    "progressPercent": 64,
    "participantCount": 2400
  },
  "weeklyLeaderboard": [
    { "rank": 2, "username": "Elena_Poly", "xp": 2840 },
    { "rank": 1, "username": "Mika_Sensei", "xp": 3120 },
    { "rank": 3, "username": "AlexLangs", "xp": 2410 }
  ],
  "studyGroups": [
    {
      "id": "sg-001",
      "icon": "coffee",
      "iconBg": "#6bff8f",
      "iconColor": "#007432",
      "title": "Spanish Coffee Chat",
      "description": "Daily conversational practice for intermediate learners.",
      "memberCount": 124
    },
    {
      "id": "sg-002",
      "icon": "pencil",
      "iconBg": "#facaf9",
      "iconColor": "#785179",
      "title": "Japanese Kanji Masters",
      "description": "Flashcard drills and etymology deep dives for JLPT N2.",
      "memberCount": 89
    },
    {
      "id": "sg-003",
      "icon": "book-open-variant",
      "iconBg": "#a5ed50",
      "iconColor": "#3f6900",
      "title": "French Literature Club",
      "description": "Reading and discussing classic French novels together.",
      "memberCount": 57
    },
    {
      "id": "sg-004",
      "icon": "microphone",
      "iconBg": "#e8f5d0",
      "iconColor": "#3f6a00",
      "title": "Arabic Pronunciation",
      "description": "Focused sessions on mastering Arabic phonetics.",
"memberCount": 43
    }
  ]
}
```

### Example API Response Structure

Here are the recommended Next.js API route handlers for each endpoint.

```ts
// app/api/onboarding/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/onboarding.json');
  return Response.json(data.default);
}
```

```ts
// app/api/home/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/home.json');
  return Response.json(data.default);
}
```

```ts
// app/api/daily/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/daily.json');
  return Response.json(data.default);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Process answer, return updated progress
  return Response.json({ correct: body.answer === 'a' });
}
```

```ts
// app/api/tutor/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/tutor.json');
  return Response.json(data.default);
}
```

```ts
// app/api/profile/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/profile.json');
  return Response.json(data.default);
}
```

```ts
// app/api/grammar/detail/[id]/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/grammar-detail.json');
  return Response.json(data.default);
}
```

```ts
// app/api/grammar/history/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/grammar-history.json');
  return Response.json(data.default);
}
```

```ts
// app/api/lessons/[id]/results/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/lesson-results.json');
  return Response.json(data.default);
}
```

```ts
// app/api/mistakes/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/review-mistakes.json');
  return Response.json(data.default);
}
```

```ts
// app/api/settings/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/settings.json');
  return Response.json(data.default);
}
```

```ts
// app/api/community/route.ts
export async function GET() {
  const data = await import('@/lib/api/mock/data/community.json');
  return Response.json(data.default);
}
```

---

## Next.js API Implementation

### Data Access Patterns

1. **Static Import** (Development/Mock)
   ```ts
   import onboardingData from '@/lib/api/mock/data/onboarding.json';
   ```

2. **Dynamic Import** (API Routes)
   ```ts
   import { promises as fs } from 'fs';
   import path from 'path';

   export async function GET() {
     const data = JSON.parse(
       await fs.readFile(
         path.join(process.cwd(), 'lib/api/mock/data/onboarding.json'),
         'utf8'
       )
     );
     return Response.json(data);
   }
   ```

### Recommended Route Structure

```
app/api/
├── onboarding/
│   └── route.ts         → GET languages, goals
├── home/
│   └── route.ts         → GET dashboard data
├── daily/
│   └── route.ts         → GET/POST daily exercise
├── tutor/
│   ├── sessions/
│   │   └── route.ts   → GET sessions list
│   └── messages/
│       └── route.ts    → POST new message
├── profile/
│   ├── route.ts       → GET profile
│   └── route.ts       → PATCH profile
├── grammar/
│   ├── detail/[id]/
│   │   └── route.ts  → GET grammar rule
│   └── history/
│       └── route.ts   → GET mastery history
├── lessons/
│   ├── [id]/
│   │   └── route.ts  → GET lesson
│   └── [id]/results/
│       └── route.ts  → GET/POST results
├── mistakes/
│   └── route.ts      → GET review items
├── settings/
│   └── route.ts      → GET/PATCH settings
└── community/
    └── route.ts      → GET groups + leaderboard
```

### Type Definitions

Create shared types at `types/api.ts`:

```ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  nativeLanguage: string;
  learningLanguage: string;
  dailyGoalMinutes: number;
  streakDays: number;
  createdAt: string;
}

export interface Language {
  id: string;
  label: string;
  native: string;
  icon: string;
  iconColor: string;
  isFeatured: boolean;
  corner: 'tl' | 'tr' | 'bl' | 'br' | 'none';
}

export interface GoalOption {
  id: string;
  label: string;
  description: string;
  minutesPerDay: number;
  icon: string;
  isRecommended: boolean;
}

// ... add other interfaces
```

### Environment Handling

```ts
// lib/api/index.ts
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.API_URL;

export async function fetchAPI<T>(endpoint: string): Promise<T> {
  if (USE_MOCK) {
    const data = await import(`@/lib/api/mock/data/${endpoint}.json`);
    return data.default as T;
  }

  const res = await fetch(`${process.env.API_URL}/${endpoint}`);
  return res.json();
}
```