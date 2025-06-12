# TU Delft Library One-Box Search

Implementation for a one-box search across various Library resources.

Based on [this prototype](https://observablehq.com/@tudelft/one-box-search).

Prototype live on [this page](https://www.tudelft.nl/library/zoeken-4).

## Development

Install [Bun](https://bun.sh/docs/installation) JavaScript runtime.

To create a bundle:

```bash
bun install
bun run build
```

You can also automatically recreate this bundle upon changes by running:

```bash
bun run watch
```

This will output the file `index.js` in the `dist` folder. When running the `build` command it will write an additional minimized version `index.min.js`. To test the script install [Tampermonkey](https://www.tampermonkey.net/) for Google Chrome and create a new userscript with the following contents:

```js
// ==UserScript==
// @name        One-Box Search
// @description Searching across TU Delft Library resources
// @version     2025-02-18
// @match       https://www.tudelft.nl/*library/zoeken-dev*
// @require     file:///path-to-repository/dist/index.js
// ==/UserScript==
```

Replace `path-to-repository` for the full path to the cloned GitHub repository, e.g. `Users/username/Documents/GitHub/one-box-search/dist/index.js`.

Make sure to enable `Allow access to file URLs` for Tampermonkey under Manage Extensions > Tampermonkey > Details. See also:

- [I want to use an external editor to edit my scripts. How can this be done?](https://www.tampermonkey.net/faq.php#Q402) (Tampermonkey FAQ)
- [Develop Tampermonkey scripts in a real IDE with automatic deployment...](https://stackoverflow.com/questions/41212558/develop-tampermonkey-scripts-in-a-real-ide-with-automatic-deployment-to-openuser) (Stack Overflow)

Visit the following URL to test the script: [https://www.tudelft.nl/library/zoeken-dev](https://www.tudelft.nl/library/zoeken-dev)

## Databases

In order to search the [databases](https://databases.tudl.tudelft.nl/), this repository includes a json file of this entire resource in the `./data` directory. It can be refreshed by running:

```bash
bun install
bun run fetch-databases.ts
```

## Todo

- [ ] Bilingual results
- [x] Integrate Library result count in flex box
- [x] Fixed positions for results (with loading indicator)
- [ ] Align buttons
- [x] Show notice if no results
- [x] Add [databases](https://databases.tudl.tudelft.nl/)
  - Based on [metadata](https://databases.tudl.tudelft.nl/wp-content/uploads/sites/20/databases_content_metadata.csv) file
  - Prioritize titles, then abstract
  - Show faculties as tags, link to [page](https://databases.tudl.tudelft.nl/?f=AE) with databases for specific faculty
  - Show title, access info (if available), abstract (abbreviate), format
  - Link directly to database
  - Button to all databases
- [ ] Automatically publish build as release and remove build folder from repo

---

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
