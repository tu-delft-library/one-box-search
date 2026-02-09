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
// @match       https://www.tudelft.nl/library/zoeken-dev*
// @match       https://www.tudelft.nl/en/library/search-dev*
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

- An open HTTPS API endpoint that accepts queries and returns a JSON response (the script runs client-side so API keys will be exposed).
- Friendly [CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- Pagination / limits on returned responses (currently only three results are shown)
- Total result count (can be included as a HTTP response header if needed)
- Possibility to link to full search results

For individual items (this list might be expanded):

|Field|Key|Value type|Required|Example|
|---|---|---|---|---|
|Title|`title`|`string`|✓|`"Gedenkschrift van de Koninklijke Academie en van de Polytechnische School"` |
|Author(s)|`creator`|`string[]`| |`["H.H.R. Roelofs Heyrmans", "Technische Hogeschool"]` |
|Date in a [parsable format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format)|`date`|`string \| number`| |`"1906-01-01T00:00:00.000Z"` \| `-2019686400000` |
|URL for item|`url`|`string`|✓|`"https://heritage.tudelft.nl/objects/txf-18197"` |
|Description|`description`|`string`| |`"Samengesteld ter gelegenheid van de oprichting der Technische Hoogeschool"` |
|Object type(s)|`type`|`{en?: string, nl?: string}[]`||`[{"nl": "Boek", "en": "Book"}]` | 
|[IIIF Image API](https://iiif.io/api/image/3.0/) endpoint|`image`|`string`||`"https://dlc.services/iiif-img/v3/7/6/69a9bc61-f3db-4f73-9d01-32c5e128fdbe"` |

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
