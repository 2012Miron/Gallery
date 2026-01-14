# Translating
Gallery supports multiple languages. For now, Gallery supports English, Russian and Ukrainian languages. You can help to translate Gallery into other languages or improve existing translations.

## Pages
The main text of the site stored into `pages/your_language` folder. Just clone one of existing language folder, rename it to your language code (e.g. `fr` for French) and translate the html files inside. **Don't change mark up of the pages!!!**. Just translate the text content.
## `settings.json`
Some text strings are stored in the `settings.json` file. To translate these strings, copy existing language section (e.g. `languageOption.ru`) to your language code and translate the strings inside. Some strings **must** match similar strings on pages. For example, if you have a page with title "Upload" then the corresponding string in `settings.json` must also be "Upload" (or its translation in your language).
## Documentation
The documentation files in `docs/` folder can also be translated. Just create a copy of existing language file (e.g. `Integration.md` to `Integration_fr.md`) and translate the content inside.
When translating, please ensure the formatting and code snippets remain unchanged.
