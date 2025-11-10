# TU Delft Library One-Box Search

Implementation for a one-box search across various Library resources.

Based on [this prototype](https://observablehq.com/@tudelft/one-box-search).

Prototype live on [this page](https://www.tudelft.nl/library/zoeken-4).

## Development

Install [Bun](https://bun.sh/docs/installation) JavaScript runtime.

To create a bundle:

```bash
bun run build
```

You can also automatically recreate this bundle upon changes by running:

```bash
bun run watch
```

This will output the file `search.js` in the `dist` folder. When running the `build` command it will write an additional minimized version `search.min.js`. To test the script install [Tampermonkey](https://www.tampermonkey.net/) for Google Chrome and create a new userscript with the following contents:

```js
// ==UserScript==
// @name        One-Box Search
// @description Searching across TU Delft Library resources
// @version     2025-02-18
// @match       https://www.tudelft.nl/*library/zoeken-dev*
// @require     file:///path-to-repository/dist/search.js
// ==/UserScript==
```

Replace `path-to-repository` for the full path to the cloned GitHub repository, e.g. `Users/username/Documents/GitHub/one-box-search/dist/search.js`.

Make sure to enable `Allow access to file URLs` for Tampermonkey under Manage Extensions > Tampermonkey > Details. See also:

- [I want to use an external editor to edit my scripts. How can this be done?](https://www.tampermonkey.net/faq.php#Q402) (Tampermonkey FAQ)
- [Develop Tampermonkey scripts in a real IDE with automatic deployment...](https://stackoverflow.com/questions/41212558/develop-tampermonkey-scripts-in-a-real-ide-with-automatic-deployment-to-openuser) (Stack Overflow)

Visit the following URL to test the script: [https://www.tudelft.nl/library/zoeken-dev](https://www.tudelft.nl/library/zoeken-dev)

## Requirements

For adding new APIs, please take note of the following requirements:

- HTTPS API endpoint that accepts queries and returns a JSON response
- Friendly CORS headers
- Pagination / limits on returned responses (currently only three results are shown)
- Total result count (can be included as a HTTP response header if needed)
- Possibility to link to full search results
- For individual items (list might be expanded):
  - Title (`string`)
  - Author(s) (`string[]`)
  - Date in a [parsable format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format) (`string | number`)
  - URL for item (`string`)
  - Description (`string`)
  - Object type(s) (`string[]`)
  - [IIIF Image API](https://iiif.io/api/image/3.0/) endpoint (optional) (`string`)

Currently all implemented APIs return different responses which are parsed using custom functions in `providers.ts`. The response format may therefore differ from what is indicated above.

## Databases

In order to search the [databases](https://databases.tudl.tudelft.nl/), this repository includes a static json index of this resource in the `./data` directory. It can be refreshed by running:

```bash
bun install
bun run fetch-databases.ts
```

Through a [GitHub Action](.github/workflows/databases.yml) this script is triggered every day at midnight. Changes are automatically committed to the repository. The index is deployed to `https://tu-delft-library.github.io/one-box-search/databases.json` through GitHub Pages. The search script fetches this index in order to perform the search client-side.

---

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
