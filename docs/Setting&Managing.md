# Settings & Managing
This document will describe all the configuration options in the `settings.json` file.
## Configuration Options
### `info`
- `language`: (string) Default language for the gallery interface. Example: `"en"` for English.
- `name`: (string) Name of the gallery site displayed in the UI.
- `name-e`: (string) Site name in the genitive case (only for Ukrainian and Russian languages).
- `about`: (HTML string) Description about the gallery site.
- `owner`: (string) Name of the site owner or organization.
- `logo`: (string) Path to the logo image file displayed in the UI.
- `favicon`: (string) Path to the favicon image file for the site.
- `favicon-hny` and `logo-hny`: (string) Paths to New Year's vaersions of favicon and logo images.
### `rules`
- `display`: (HTML string) Rules or guidelines displayed to users on about page.
- `add`: (string) Rules for who can upload and add new content (only the values `​​"all"`, `"admin"`, and `"super"` are supported.)
- `change`: (string) Rules for who can edit or change existing content (only the values `​​"all"`, `"admin"`, and `"super"` are supported.)
- `delete`: (string) Rules for who can delete content (only the values `​​"all"`, `"admin"`, and `"super"` are supported.)
### `languageOption`
See the [docs/Translating.md](Translating.md) for details on adding and managing languages.
### `tech`
- `port`: (number) Port number for the server to listen on. Default is `3000`.
- `dataPath`: (string) Path to the folder where images and documents are stored. Default is `"./pictures/"`.
- `secureconnection`: (boolean) If `true`, the server will use HTTPS. Default is `false`.
- `styles`: (string) Path to a custom CSS file for styling the gallery UI.