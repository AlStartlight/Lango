# Lango AI

## Overview

Lango AI is a real-time adaptive language learning platform. Users describe their learning goals in plain English, an AI tutor personalizes a curriculum, live sessions are matched with native-speaking tutors, and the app tracks progress through an intelligent feedback loop.

## Goals

1. Let authenticated users create and manage language learning profiles.
2. Provide a conversational AI tutor that adapts to the learner's level and pace.
3. Let users browse and book sessions with verified native-speaker tutors.
4. Let AI generate personalized lesson plans from a natural language goal prompt.
5. Let learners practice through AI-driven exercises, quizzes, and role-play.
6. Convert session activity and exercise results into a persistent progress report.

## Core User Flow

1. User signs in.
2. User creates or updates their learning profile (target language, current level, goals).
3. User enters the learning dashboard.
4. User optionally imports a starter lesson plan template or generates one via AI.
5. User prompts the AI tutor to generate or extend a lesson.
6. AI generates vocabulary sets, grammar exercises, and conversation starters.
7. User completes exercises; AI scores and explains results in real time.
8. User books a live session with a native tutor.
9. After the session, AI summarizes feedback and updates the progress tracker.
10. User reviews their progress report and downloads it.

## Features

### Authentication and Profiles

- User sign-in and route protection.
- Learner profile: target language, native language, proficiency level, and weekly goal.
- Tutor profile: verified native speaker, languages taught, availability, and ratings.

### AI Tutor

- Conversational AI that teaches vocabulary, grammar, pronunciation tips, and cultural context.
- Adaptive difficulty: adjusts content complexity based on learner performance history.
- Supports Socratic dialogue, role-play scenarios, and translation drills.
- Generation runs as a durable background task when producing full lesson plans.

### Lesson Plans

- AI generates a structured multi-week lesson plan from a user-supplied goal prompt.
- Plan contains milestones, daily exercises, vocabulary targets, and grammar topics.
- Plans are persisted and linked to the learner's profile.

### Exercise Engine

- Interactive exercise types: multiple choice, fill-in-the-blank, listening comprehension, and free-text translation.
- AI evaluates free-text answers with explanations.
- Score history is stored per learner per exercise.

### Tutor Marketplace

- Browse verified native-speaker tutors filtered by language, rating, price, and availability.
- Book 1:1 or group sessions directly from the platform.
- Session room: live video/audio, shared text pad, and AI co-pilot suggestions in sidebar.

### Starter Lesson Templates

- A curated library of prebuilt lesson templates for common goals: travel, business, exam prep, and conversational fluency.
- Users can import a template into their active plan at any time.
- Templates are static structured lesson snapshots resolved by template ID.

### Progress Tracking

- Dashboard showing streak, weekly minutes, vocabulary mastered, and grammar units completed.
- AI generates a narrative progress summary after each session.
- Reports are persisted as Markdown files and linked to the learner profile.

## Scope

### In Scope

- Authentication and route protection
- Learner and tutor profile management
- AI-powered adaptive lesson generation from prompts
- Exercise engine with AI evaluation
- Starter lesson plan template library and import
- Tutor browse and session booking
- Live session room with AI co-pilot sidebar
- Progress tracking dashboard and report generation
- Persistent storage for profiles, lesson plans, exercise history, and reports
- Report download

### Out Of Scope

- Billing and subscription management (payment processing)
- Enterprise or school-tier admin dashboards
- Offline mobile apps
- Video/audio infrastructure (delegated to third-party provider)
- Versioned curriculum history and review workflows

## Success Criteria

1. A signed-in learner can create a profile and generate a lesson plan from a prompt.
2. The AI tutor can hold an adaptive conversation and evaluate free-text answers.
3. A learner can import a starter template into their active plan.
4. A learner can browse tutors and book a session.
5. The session room provides a shared workspace with AI co-pilot suggestions.
6. Progress data and generated reports are stored in the correct persistence layers.
