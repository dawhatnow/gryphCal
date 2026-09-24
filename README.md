# GryphCal

All your CourseLink assignments and quizzes on one calendar, with submission
status and grades. Built for University of Guelph students.
Built by a Gryphon, for Gryphons.

Everything runs in your browser. GryphCal reads CourseLink while you're signed in
and stores the results in chrome.storage.local. Nothing is sent anywhere else.
See the [privacy policy](PRIVACY.md).

## Install

1. Download `gryphcal.zip` from the latest [release](../../releases) and unzip it.
2. Go to chrome://extensions and turn on Developer mode.
3. Click "Load unpacked" and pick the unzipped folder.
4. Open CourseLink, pick your courses, done.

## Build it yourself

    npm install
    npm run build

Then go to chrome://extensions, turn on Developer mode, click "Load unpacked",
and pick the `dist` folder. Open CourseLink, pick your courses, done.
After changing code: run `npm run build` again and hit the reload icon on the
extension card.

## Read the code in this order

1. `src/types.ts`: the Course and Deadline shapes. Everything else revolves around these.
2. `src/content/api.ts`: the requests to CourseLink's API.
3. `src/content/normalize.ts`: raw API objects into clean Deadlines. The heart of the project.
4. `src/content/sync.ts`: the whole fetch process, step by step.
5. `src/content/index.ts`: when syncing happens.
6. `src/shared/storage.ts` and `useStore.ts`: how the UI reads the data and stays live.
7. `src/shared/dates.ts`: calendar math.
8. `src/shared/components/MonthGrid.tsx`: the calendar grid.
9. `src/popup/Popup.tsx` and `src/calendar/CalendarPage.tsx`: the two screens.

## If data is missing

The endpoints in `src/content/api.ts` follow Brightspace's documented API but
haven't been tested on UofG's CourseLink yet. Open CourseLink, DevTools >
Network, filter by "api", and compare the real responses with the Raw* types.

## License

[MIT](LICENSE). Not affiliated with the University of Guelph or D2L.
