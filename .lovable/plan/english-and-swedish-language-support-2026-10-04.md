# English and Swedish language support

## What will change
- Add a compact language selector in the header with English selected by default.
- Translate all visible interface text, including upload guidance, warnings, progress, buttons, statistics, insights, drills, summary headings, and footer.
- Send the chosen language with every analysis segment so generated summaries, strengths, weaknesses, and drill recommendations use that language.
- Keep player colors and positions readable in the selected language.

## Technical details
- Use a shared typed translation module so all screens and reusable components use the same wording.
- Keep the selected language stable during an analysis and pass `en` or `sv` to the analysis function.
- Update the analysis prompt to require all natural-language output in the selected language while preserving the JSON field names used by the app.
- Verify the English and Swedish start pages in the browser and check the latest build status.
