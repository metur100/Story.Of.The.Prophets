# Story of the Prophets

An interactive Islamic storybook game that teaches children the stories of the prophets as told in the Quran — through scenes, choices, mini games and reflection.

- Free: no ads, no purchases, no subscriptions, no accounts
- Fully offline, no network access at all
- Bosnian, German and English
- Built with Expo (React Native) + TypeScript

## Stories

Adam · Nuh · Ibrahim · Musa · Yusuf · Yunus · Isa · Muhammad ﷺ — unlocked in chronological order.

Every story follows the same interactive flow (built by `src/services/storyFlow.ts`):

```
INTRO → STORY → INTERACTION → STORY → QUESTION → STORY → MINI GAME → LESSON → QUIZ → REWARD
```

The child never reads more than one story page without interacting.

### Interaction types

Multiple choice ("What do you think happened next?"), true/false, ordering, **timeline**, memory, **decision** (scenario), **find the objects** (illustrated object tiles), **map interaction** (tap the place on an illustrated map) and **choose the correct lesson**.

Wrong answers never show "Wrong": the child sees **"Not quite"**, the correct answer and an explanation, and the question goes into a spaced **review queue** (Review tab).

### What did we learn?

Each story ends with lessons — title, short explanation, practical example and a reflection question.

## Religious accuracy

- Content lives in `src/content/prophets/<prophet>.json` (id, title, description, scenes, questions, lessons, sources) — separate from code.
- Stories are retold from the Quran without invented events or dialogue; every scene and question cites surah:ayah (plus Sahih al-Bukhari / Ibn Hisham where used).
- Prophets are never depicted. Illustrations (`src/components/scene/SceneView.tsx`) show only landscapes, architecture, weather and objects; the story map uses symbolic objects.
- Map positions are approximate and labelled as such.

## Progress & motivation

Stories, scenes, quiz scores, lessons learned, XP/levels, review questions and badges (Story Explorer, History Learner, Prophet Explorer, Sabr Champion, Knowledge Seeker, Perfect Story, Review Master, Daily Learner). A story left part-way can be resumed ("Continue story"). The home screen shows Continue Story, Featured Story, Your Progress, Daily Question and Recently Completed.

## Structure

```
src/
  app/          Expo Router screens: (tabs)/index, map, review, profile · story/[id] · play/[id] · daily · settings · onboarding · info/[page]
  components/   ui/ (shared kit), questions/ (all mini games), steps/ (story & lessons views), scene/, game/
  content/      prophets/*.json, places.ts, typed loader
  models/       Story, StoryScene, StoryLesson, Question, GameState, …
  services/     storyFlow, unlocking, quiz, review, xp, badges, daily, gameEngine, sound
  storage/      AsyncStorage persistence with migration
  store/        Zustand store with debounced autosave
  localization/ en / de / bs
```

## Scripts

```bash
npm install
npm start               # dev server
npm run android         # development build on device/emulator
npm run verify          # typecheck + lint + tests
```

Android release build:

```bash
npx expo prebuild --platform android
cd android && ./gradlew bundleRelease assembleRelease
# → android/app/build/outputs/bundle/release/app-release.aab  (Google Play)
# → android/app/build/outputs/apk/release/app-release.apk  (direct install)
```

Release builds are signed with the upload key configured in `~/.gradle/gradle.properties` (see `plugins/withReleaseSigning.js`):

```properties
STORY_OF_THE_PROPHETS_UPLOAD_STORE_FILE=C:/path/to/keystore
STORY_OF_THE_PROPHETS_UPLOAD_STORE_PASSWORD=…
STORY_OF_THE_PROPHETS_UPLOAD_KEY_ALIAS=…
STORY_OF_THE_PROPHETS_UPLOAD_KEY_PASSWORD=…
```

Without these properties the build falls back to the debug key (fine for testing). The keystore and passwords are never committed.

`plugins/withStableAndroidBuild.js` makes local Gradle builds reliable on Windows (in-process Kotlin compilation).

## Privacy

No data leaves the device; progress can be deleted in Settings → Reset progress.
