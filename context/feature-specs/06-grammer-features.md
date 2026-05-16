Feature Specification: Grammar Learning Module
Product: Lango (https://lango-sooty.vercel.app/en)
Feature: English Grammar Learning Module
Target Language: English
Target Users: ESL/EFL learners (Beginner to Advanced levels)
Document Version: 1.0
Date: 2026-05-13

1. Executive Summary
This feature specification defines the English Grammar Learning Module for Lango — an interactive, adaptive grammar-learning experience that combines structured lessons, intelligent practice, and progress tracking. The module provides learners with comprehensive coverage of English grammar concepts, from foundational rules to advanced structures, through bite-sized interactive lessons that follow modern language acquisition principles.

Key Value Propositions:

Transforms abstract grammar rules into engaging, interactive lessons

Adapts to learner performance, reinforcing weak areas automatically

Integrates seamlessly with Lango‘s existing course structure

Provides immediate, actionable feedback to accelerate mastery

Gamifies grammar learning to maintain sustained engagement

2. User Personas
Persona	Description	Goals
Casual Learner	Learning English for travel or basic communication	Master essential grammar quickly; minimal time commitment
Academic Learner	Preparing for English proficiency exams (IELTS, TOEFL, TOEIC, Duolingo English Test)	Achieve high-level accuracy; understand nuanced rules
Professional Learner	Learning English for career advancement	Improve written communication; master business grammar contexts
Struggling Learner	Has attempted English before but struggles with specific concepts (e.g., articles, prepositions, verb tenses)	Identify and fix persistent grammar gaps through targeted intervention
3. Functional Requirements
3.1 Lesson Module
Req ID	Requirement	Priority
GRAM-01	Platform must offer a structured curriculum of grammar lessons, organized by CEFR levels (A1–C1) and grammar categories (nouns, verbs, tenses, sentence structure, modifiers, conjunctions)	P0
GRAM-02	Each lesson must include: a title, lesson type classification, content (text and/or media), illustrative examples, difficulty level, and associated practice exercises	P0
GRAM-03	Each lesson must include clear rule explanations, contextual examples, visual aids (diagrams and tables), and audio pronunciations of key terms and example sentences	P0
GRAM-04	Lessons must cover core English grammar topics spanning all parts of speech, sentence structures, and usage conventions	P0
GRAM-05	Learners can mark lessons as completed; completion status must be persistently stored in user progress data	P1
GRAM-06	Platform must provide a suggested learning path (linear sequence of lessons) based on the learner‘s proficiency level, as well as a freestyle navigation option	P1
GRAM-07	Each lesson must be accompanied by 3–5 interactive practice exercises that apply the taught grammar concept in context	P0
3.2 Interactive Exercise Types
Req ID	Requirement	Priority
GRAM-08	Platform must support at least four core exercise types: Multiple Choice (select correct answer), Fill-in-the-Blank (type missing word/phrase), Sentence Ordering (arrange words into correct grammatical sequence), and Correction (identify/fix error in given sentence)	P0
GRAM-09	Platform may support additional exercise types as premium content: Drag-and-Drop (match grammar components), Audio Dictation (transcribe spoken sentence), Transformation (convert between grammatical forms), and Paragraph Completion (apply grammar in extended context)	P2
GRAM-10	Fill-in-the-Blank exercises must accept multiple valid variations when applicable, using flexible answer matching (e.g., case‑insensitive, contraction expansion, slight spelling tolerance)	P1
GRAM-11	At least two practice exercises must be provided for each grammar concept introduced in a lesson	P0
GRAM-12	Exercises must present grammar concepts in meaningful contexts (complete sentences, short paragraphs, dialogues) rather than isolated rule recitation	P0
3.3 Adaptive Review & Spaced Repetition
Req ID	Requirement	Priority
GRAM-13	Platform must track user responses and identify concepts where the learner consistently makes errors (Confusion Detection)	P0
GRAM-14	A “Needs Review” dashboard must highlight concepts requiring reinforcement, organized by priority level based on error frequency and recency	P0
GRAM-15	Platform must automatically surface review exercises for high-priority weak concepts at optimal intervals (daily or every 2–3 sessions)	P1
GRAM-16	Platform must periodically re-test previously mastered concepts to ensure long-term retention	P2
3.4 Progress Dashboard & Analytics
Req ID	Requirement	Priority
GRAM-17	A dedicated Grammar Dashboard must display: overall mastery percentage, lesson completion count (completed / total), recent activity, and comparative performance insights (e.g., “You‘re outperforming X% of learners this month”)	P0
GRAM-18	Dashboard must show a CEFR level progression indicator (A1 → A2 → B1 → B2 → C1), helping learners visualize advancement along internationally recognized standards	P1
GRAM-19	Platform must generate category-level breakdowns showing mastery percentages for each major grammar category (tenses, articles, prepositions, subject-verb agreement, etc.)	P1
GRAM-20	A learning timeline/history view must display completed lessons with dates, proficiency levels achieved, and performance scores	P1
GRAM-21	Platform must provide detailed error analysis reports showing frequent error types and patterns (e.g., “article omission: 8 errors this week”)	P2
3.5 Gamification & Engagement
Req ID	Requirement	Priority
GRAM-22	Platform must award experience points (XP) upon lesson completion and correct exercise answers, proportional to difficulty and accuracy	P1
GRAM-23	Platform must support streak tracking for consecutive days of grammar practice, with visual reinforcement and milestone celebrations	P1
GRAM-24	Badges must be unlocked for specific achievements: lesson milestones, streak achievements, accuracy thresholds, and topic mastery completions	P2
GRAM-25	An achievement gallery must display earned badges, including date earned and badge descriptions	P2
GRAM-26	A leaderboard may allow learners to compare grammar progress with friends or global users (configurable privacy settings required)	P2
3.6 Learning Timeline & History
Req ID	Requirement	Priority
GRAM-27	Platform must display a chronological timeline of all grammar activities, including: lessons completed (with date and score), exercises attempted (with accuracy and timestamp), mastered concepts (date achieved), and review sessions completed	P1
GRAM-28	Timeline items must be sortable and filterable by date range, activity type, grammar category, and performance outcome	P2
GRAM-29	A “See Full History” view must provide paginated access to all historical grammar learning activities for audit and review purposes	P1
GRAM-30	Platform must include a visual progress chart (line graph or bar chart) showing mastery improvement over time, with weekly/monthly aggregation options	P2
3.7 Grammar Reference
Req ID	Requirement	Priority
GRAM-31	Platform must provide a searchable Grammar Reference Library containing all grammar rules, exceptions, and examples covered in the curriculum	P1
GRAM-32	Grammar reference entries must be linked to relevant lessons and practice exercises for immediate application	P1
GRAM-33	A “Quick Lookup” feature must allow learners to view rule explanations without leaving an exercise (e.g., tooltip or modal with condensed explanation)	P1
4. User Flows
Flow 1: New Lesson Journey
text
User selects a lesson from Grammar Hub
       ↓
View lesson introduction + concept explanation (text, tables, examples)
       ↓
Work through 3–5 interactive exercises (immediate feedback after each)
       ↓
Receive summary: correct/incorrect count, XP earned, mastery update
       ↓
Option to review mistakes, proceed to next lesson, or return to dashboard
Flow 2: Adaptive Review Journey
text
User accesses dashboard → “Needs Review” section highlights weak concepts
       ↓
Select a high-priority concept to review
       ↓
Platform presents targeted exercises addressing specific error patterns
       ↓
Track improvement through progressively harder variants
       ↓
Concept moves to “Maintained” status after demonstrated mastery across 3+ sessions
Flow 3: Mastery Completion Journey
text
User completes all lessons in a grammar category (e.g., “Verb Tenses”)
       ↓
Platform triggers a category mastery quiz (comprehensive assessment)
       ↓
Upon passing (≥80% accuracy), category is marked “Mastered” in dashboard
       ↓
Unlock category completion badge + XP bonus
       ↓
Category mastery contributes to overall CEFR level progression
5. Technical Requirements
5.1 Performance & Scalability
Req ID	Requirement
TECH-01	Lesson content and exercises must load within 2 seconds (target: <1.5s)
TECH-02	Platform must support at least 5,000 concurrent learners during peak usage
TECH-03	Exercise answer validation must complete in <500ms to provide immediate feedback
TECH-04	All assets (audio, images) must be cached for offline access where possible
5.2 Data Models
GrammarLesson

id (string): Unique identifier

title (string)

description (text)

category (enum): nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, determiners, sentence_structure, punctuation

subcategory (string, optional)

cefr_level (enum): A1, A2, B1, B2, C1

difficulty (enum): beginner, intermediate, advanced

content (JSON): structured lesson content (explanations, tables, examples)

audio_urls (array): optional audio resources

image_urls (array): optional visual aids

estimated_duration (integer): minutes

order (integer): sequence position within category

created_at (timestamp)

updated_at (timestamp)

GrammarExercise

id (string): Unique identifier

lesson_id (string): Foreign key to GrammarLesson

type (enum): multiple_choice, fill_blank, ordering, correction, drag_drop, dictation, transformation, paragraph

question_text (text)

options (JSON): for multiple choice and drag-drop types

correct_answer (string or array): validation reference

answer_variants (array, optional): accepted alternative answers

context_sentence (text, optional): for contextual learning

hint (text, optional)

explanation (text): feedback shown after answering

difficulty (enum): easy, medium, hard

points (integer): XP awarded for correct answer

created_at (timestamp)

UserGrammarProgress

user_id (string)

lesson_id (string)

status (enum): not_started, in_progress, completed, mastered

completion_date (timestamp, nullable)

attempt_count (integer)

best_score (float): percentage

last_score (float): percentage

last_attempt_date (timestamp)

time_spent (integer): total seconds

UserGrammarMastery

user_id (string)

concept_id (string): grammar concept identifier

mastery_level (float): 0.0–1.0 calculated score

review_count (integer): times concept has been reviewed

error_count (integer): total errors for this concept

last_practiced (timestamp)

next_review_date (timestamp): spaced repetition scheduling

priority (enum): high, medium, low, none

Badge

id (string)

name (string)

description (text)

icon_url (string)

trigger_type (enum): lesson_milestone, streak_achievement, accuracy_threshold, category_mastery, speed_challenge

trigger_value (integer or float)

created_at (timestamp)

5.3 API Requirements
Req ID	Requirement
TECH-05	RESTful API endpoints for: lesson retrieval, exercise submission, progress sync, dashboard data, and badge management
TECH-06	Real-time WebSocket support for live exercise feedback (optional for V2)
TECH-07	All API responses must include appropriate HTTP status codes and standardized error messages
5.4 Security & Privacy
Req ID	Requirement
TECH-08	All user progress data must be encrypted at rest and in transit (TLS 1.2+)
TECH-09	User authentication required for all grammar features (consistent with Lango‘s existing auth system)
TECH-10	No PII (personally identifiable information) to be logged in analytics systems
TECH-11	GDPR and CCPA compliance required for EU/California users (data deletion, export, consent management)
TECH-12	User activity logs must be retained for maximum 90 days unless explicitly saved as part of progress history
5.5 Accessibility (WCAG 2.1 AA)
Req ID	Requirement
TECH-13	All interactive elements must be keyboard navigable
TECH-14	Sufficient color contrast for text and UI elements (minimum 4.5:1 for normal text)
TECH-15	ARIA labels required for all interactive exercises and form inputs
TECH-16	Screen reader must be able to parse lesson content structure (proper heading hierarchy, semantic HTML)
TECH-17	Alternative text descriptions required for all images and diagrams
TECH-18	Provide captions or transcripts for any audio content
TECH-19	Users must be able to adjust text size without breaking layout
TECH-20	Provide option to reduce motion animations for vestibular sensitivity
6. Non-Functional Requirements
Req ID	Requirement
NFR-01	Mobile-first responsive design: optimal viewing on smartphones, tablets, and desktops
NFR-02	Support for dark mode consistent with Lango‘s existing theme system
NFR-03	Offline mode: users can download grammar lessons for practice without internet connection (results sync upon reconnection)
NFR-04	Average Time on Task: complete a full lesson (explanation + exercises) in 5–10 minutes
NFR-05	First-lesson drop-off rate ≤ 25%: friction-free onboarding experience
NFR-06	99.9% uptime for lesson delivery API
NFR-07	Cross-browser compatibility: Chrome (latest 2 versions), Firefox (latest 2), Safari (latest 2), Edge (latest 2)
7. Success Metrics (KPIs)
KPI	Target	Measurement Method
Daily Active Grammar Learners (DAGL)	≥1,000 within first month	Platform analytics
Lesson Completion Rate	≥75% of started lessons completed	Event tracking
Average Lessons per Session	≥2 lessons per logged-in session	Session analytics
Weekly Retention (Week 2)	≥45% of Week 1 users return Week 2	Cohort retention analysis
Weekly Retention (Week 4)	≥25% of Week 1 users return Week 4	Cohort retention analysis
Average Quiz Accuracy	≥75% across all exercise types	Answer validation logs
Mastery Achievement Rate	≥60% of users reach “Mastered” status in ≥3 categories	Progress tracking
User Satisfaction Score (in-app survey)	≥4.2/5 stars	Post-lesson surveys
Feature Adoption	≥40% of active Lango users engage with Grammar module weekly	Feature usage tracking
8. Out of Scope (What This Spec Does NOT Cover)
AI-generated or user-submitted grammar lessons (V2/V3 consideration)

Peer-to-peer grammar discussion forums or social commenting on lessons

Live tutor integration for real-time grammar coaching

Mobile push notifications for grammar reminders (covered by existing Lango notification system)

Grammar checking tools for user-generated writing (separate feature track)

Custom grammar lesson creation by users (admin-only content management initially)

Integration with third-party grammar APIs or reference databases

Native mobile app features beyond responsive web (hybrid/webview to be addressed separately)

9. Assumptions & Dependencies
Assumptions
Lango‘s existing user authentication system is available and extendable

Lango‘s existing notification infrastructure can support grammar learning reminders

Lango‘s existing audio infrastructure supports pronunciation playback

Development team has access to frontend/backend capabilities necessary for implementation

Content team can produce approximately 50–75 high-quality grammar lessons prior to launch

Infrastructure costs for additional data storage and compute are accounted for in budget

Dependencies
Lesson content library must be fully authored and peer-reviewed before feature launch

UI/UX designs must be completed before frontend development begins

QA testing environment must be provisioned for pre-launch validation

User acceptance testing (UAT) must be completed with real learner cohorts

Documentation and help center articles must be published concurrently with launch

Analytics instrumentation must be configured prior to user testing

10. Phased Roadmap
Phase 0 — Foundations (Week 1–3)
Database schema design and migration

API endpoint architecture

Basic lesson data models

Authentication integration

Phase 1 — MVP (Week 4–8)
Lesson viewing with explanations and examples

Four core exercise types (multiple choice, fill-in-the-blank, ordering, correction)

Basic progress tracking (completion status, scores)

Grammar Dashboard (mastery percentage, lesson completion count)

“Mark as Mastered” functionality

Phase 2 — Adaptive & Social (Week 9–12)
Confusion detection and Needs Review dashboard

Spaced repetition review scheduling

Badges and achievements system

Leaderboards (optional, with privacy controls)

Category mastery quizzes

Phase 3 — Advanced Features (Week 13–16)
Grammar Reference Library with search

Advanced exercise types (drag-drop, dictation, transformation, paragraph completion)

Offline mode support

Detailed error analytics and reporting

Learning timeline visualization with charts

11. Risk Assessment
Risk	Probability	Impact	Mitigation Strategy
Content quality inconsistency across lessons	Medium	High	Implement peer review workflow; establish style guide for lesson authors; user feedback mechanism for flagging issues
Low user engagement after initial launch	Medium	High	Monitor KPIs closely; A/B test engagement features; implement targeted email nudges for inactive users
Technical integration issues with existing Lango platform	Low	Medium	Conduct architecture review before development; allocate buffer time for integration testing; maintain open communication with platform owners
Inaccurate difficulty calibration (lessons too easy/hard)	Medium	Medium	Run user testing sessions with representative learners; implement difficulty adjustment based on aggregated performance data; allow user feedback on lesson difficulty
Data privacy concerns with progress tracking	Low	Medium	Clear privacy policy disclosure; granular user controls for data deletion and export; regular security audits
Mobile performance issues (slow load times)	Medium	Medium	Optimize asset delivery; implement lazy loading; cache lesson content locally
Accessibility non-compliance	Low	High	Include accessibility requirements in acceptance criteria; conduct automated and manual accessibility testing before launch
12. Appendices
Appendix A: CEFR Mapping — Grammar Topics by Level
CEFR Level	Grammar Topics
A1 (Beginner)	Basic sentence structure (Subject-Verb-Object), Present simple (to be, to have), Present continuous (basic), Articles (a/an), Singular/plural nouns, Basic prepositions (in, on, at), Personal pronouns (I, you, he/she/it), Possessive adjectives (my, your, his/her), Question words (what, where, when, who)
A2 (Elementary)	Past simple (regular/irregular), Present continuous vs. present simple, Future with “going to” and “will,” Comparative/superlative adjectives, Countable/uncountable nouns (some/any/much/many), Adverbs of frequency, Prepositions of time/place, Modal verbs (can, could, must, should)
B1 (Intermediate)	Present perfect (simple and continuous), Past continuous, Future continuous, Conditionals (zero, first, second), Passive voice (present/past simple), Relative clauses (who, which, that, where), Reported speech (basic statements), Gerunds and infinitives, Modal verbs (might, may, shall, ought to)
B2 (Upper Intermediate)	Past perfect (simple and continuous), Future perfect, Conditionals (third, mixed), Passive voice (all tenses), Reported speech (questions, commands, advanced), Inversion (negative adverbials), Emphasis (cleft sentences), Advanced modal usage (needn‘t, used to, be/get used to)
C1 (Advanced)	All tenses and aspects mastery, Advanced passive constructions, Subjunctive mood, Inversion in formal contexts, Ellipsis and substitution, Advanced conditional variations, Reduced relative clauses, Discourse markers and connectors
Appendix B: Sample UI Reference Layout
Based on Lango’s existing design language and the grammar lesson UI showcased in the provided screenshots:

Lesson Layout (Noun-Adjective Agreement style):

Hero section: Lesson title + brief description

Grammar rule panel: Clear, visually distinguished rules (color-coded by gender/number)

Example breakdown cards: Annotated example sentences with grammatical labels

Interactive practice area: Embedded exercise with real-time validation

Progress footer: “Mark as Mastered” button + navigation controls

Dashboard Layout (Progress tracking style):

Top section: Overall mastery percentage (circular progress indicator)

Middle section: “Needs Review — High Priority” list of weak concepts

Lower section: Learning timeline with activity cards

Bottom navigation: Learn / Tutor / Daily / Community (consistent with Lango branding)

