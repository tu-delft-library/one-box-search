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

This will output the file `index.js` in the `build` folder. To test the script install [Tampermonkey](https://www.tampermonkey.net/) for Google Chrome and create a new userscript with the following contents:

```js
// ==UserScript==
// @name        One-Box Search
// @description Searching across TU Delft Library resources
// @version     2025-02-18
// @match       https://www.tudelft.nl/*library/zoeken-dev*
// @require     file:///path-to-repository/build/index.js
// ==/UserScript==
```

Replace `path-to-repository` for the full path to the cloned GitHub repository, e.g. `Users/username/Documents/GitHub/one-box-search/build/index.js`.

Make sure to enable `Allow access to file URLs` for Tampermonkey under Manage Extensions > Tampermonkey > Details. See also:

- [I want to use an external editor to edit my scripts. How can this be done?](https://www.tampermonkey.net/faq.php#Q402) (Tampermonkey FAQ)
- [Develop Tampermonkey scripts in a real IDE with automatic deployment...](https://stackoverflow.com/questions/41212558/develop-tampermonkey-scripts-in-a-real-ide-with-automatic-deployment-to-openuser) (Stack Overflow)

Visit the following URL to test the script: [https://www.tudelft.nl/library/zoeken-dev](https://www.tudelft.nl/library/zoeken-dev)

## Todo

- [ ] Bilingual results
- [ ] Integrate Library result count in flex box
- [ ] Fixed positions for results (with loading indicator)
- [ ] Align buttons
- [ ] Show notice if no results

---

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
