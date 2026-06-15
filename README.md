# Memories 📸

**Memories** is an [Expo](https://expo.dev) photo app that resurfaces your
photos from this day in previous years — an "On This Day" view of your camera
roll.

When you open the app it asks for permission to read your photo library, then
looks at today's month and day and pulls the photos you took on that same
calendar day — for the current year and the previous 50 — grouped year by year.

## How it works

- `src/utils/memories.ts` — pure, framework-free helpers (year ranges, labels,
  percentage formatting) that are unit-tested in isolation.
- `src/hooks/use-memories.ts` — handles photo-library permissions and queries
  the library one narrow date range per year (using `expo-media-library`'s
  `Query` builder) so it never scans the whole library. It reports load
  progress, and any failure surfaces as an `error` state instead of hanging.
- `src/components/progress-bar.tsx` — the determinate progress indicator shown
  while memories load.
- `src/components/memory-row.tsx` — renders one year's memories as a hero image
  plus a thumbnail grid.
- `src/app/index.tsx` — the single "On This Day" screen, with loading
  (+progress), permission, error, and empty states. Navigation is a plain
  `Stack` (no tabs).

> Note: photo access requires a real device or simulator — `expo-media-library`
> has no web implementation, so the web build shows an informational message.

## Tests

Unit tests cover the utils, hooks, and components and run with
[`jest-expo`](https://docs.expo.dev/develop/unit-testing/) and
[`@testing-library/react-native`](https://callstack.github.io/react-native-testing-library/):

```bash
npm test
```

---

This project was created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
