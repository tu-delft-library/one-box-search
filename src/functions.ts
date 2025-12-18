import searchProviders from "./providers";
import type {
  NormalizedResults,
  SearchResult,
  Translations,
} from "./types/types";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw#building_an_identity_tag
export const html = (strings: TemplateStringsArray, ...values: any[]) =>
  String.raw({ raw: strings }, ...values);

let language: string | undefined = undefined;

export const t = (translations: Translations) =>
  language === "nl" ? translations.nl : translations.en;

export function fetchJson(url: string, body?: any) {
  const method = body ? "POST" : "GET";
  const headers = new Headers();
  const options: RequestInit = { method, headers };
  headers.append("Accept", "application/json");
  if (body) {
    headers.append("Content-Type", "application/json");
    options.body = JSON.stringify(body);
  }
  const req = new Request(url, options);
  return fetch(req).then((response) => {
    if (response.ok) {
      const { headers } = response;
      return response.json().then((results) => ({ headers, results }));
    } else return null;
  });
}

// Use preact? https://preactjs.com/
// Or: https://htmx.org/
// Or: https://lit.dev/
function createTypoRow(props: SearchResult) {
  const typeStyle = `
    background-color: #00a6d6;
    color: white;
    border-radius: 50px;
    margin-bottom: 1em;
    padding: 0 1em;
    width: max-content
  `;

  return html`
    <a
      href="${props.href}"
      title="${props.title}"
      target="_blank"
      class="news-summary"
    >
      <section>
        ${props.type
          ? `<p class="label" style="${typeStyle}">` + props.type + "</p>"
          : ""}
        <h3>${props.title}</h3>
        <div class="row">
          <div class="sm-3">
            ${props.image
              ? `
            <picture>
              <source media="(max-width: 600px)" srcset="${props.image}">
              <img alt="${props.title}" src="${props.image}">
            </picture>
            `
              : ""}
          </div>
          <div class="sm-9">
            ${props.authors ? "<p>" + props.authors + "</p>" : ""}
            ${props.description ? "<p>" + props.description + "</p>" : ""}
            ${props.date ? "<p>Published " + props.date + "</p>" : ""}
            ${props.id ? `<div class="fake-link">${props.id}</div>` : ""}
          </div>
        </div>
      </section>
    </a>
  `;
}

function createTypoResults(
  title: Translations,
  description: Translations,
  records: NormalizedResults,
  resultsUrl: string
) {
  const { count, error } = records;
  return html`
    <div class="t3ce frame-type-gridelements_pi1">
      <div class="grid-background--white grid-background--boxed">
        ${records && records.length && count
          ? count.toLocaleString() + t({ en: " results", nl: " resultaten" })
          : records && records.length
          ? t({ en: "Top 3 results", nl: "Top 3 resultaten" })
          : error
          ? t({
              en: "Results could not be fetched",
              nl: "Resultaten konden niet geladen worden",
            })
          : t({ en: "No results", nl: "Geen resultaten" })}
        <h2>${t(title)}</h2>
        <p><i>${t(description)}</i></p>
        <div class="content-container">
          ${records && records.length
            ? records.map(createTypoRow).join("\n")
            : error
            ? `<div class="news-summary" style="color:#e64616">` +
              t({
                en: "Access results through the button below",
                nl: "Toegang tot de resultaten via onderstaande knop",
              }) +
              "</div>"
            : ""}
          <div class="t3ce frame-type-sitetud_singlebutton">
            <a
              href="${resultsUrl}"
              target="_blank"
              class="btn btn--single align-center btn--royal_blue"
            >
              ${t({ en: "View all results ↗", nl: "Bekijk alle resultaten ↗" })}
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

const createSearchSubtitle = () => {
  return html`<div
    class="t3ce frame-type-text"
    style="margin-bottom:-20px;margin-top:15px;"
  >
    ${t({
      en: "Search gives results from",
      nl: "Zoeken geeft resultaten uit",
    })}
    <a href="#website"
      ><b>${t({ en: "this website", nl: "deze website" })}</b></a
    >,
    ${searchProviders
      .map(({ id, title }) => html`<a href="#${id}"><b>${t(title)}</b></a>`)
      .join(", ")}.
  </div>`;
};

export async function createResults(
  searchInput: string,
  languageInput: string
) {
  language = languageInput;
  // Get flex container
  const grid = document.querySelector(".multiRowGrid");
  if (grid) {
    // Get website result count from search box element
    const searchBox = document.querySelector("div.hiddenSidebarContent");
    if (searchBox) {
      const websiteResultCount = searchBox.innerHTML.split("</form>")[1].trim();
      // Remove website search count beneath search bar
      const subtitle = createSearchSubtitle();
      searchBox.innerHTML = searchBox.innerHTML.split("</form>")[0] + subtitle;
      const websiteResults = grid.querySelector(".sm-12");
      if (websiteResults) {
        websiteResults.id = "website";
        const websiteHeading = websiteResults.querySelector("h2");
        // Change heading and button text
        if (websiteHeading) {
          websiteHeading.textContent = t({
            en: "This website",
            nl: "Deze website",
          });
          const subtitle = document.createElement("p");
          subtitle.style.fontStyle = "italic";
          subtitle.innerText = t({
            en: "Guidelines, tools, events, news",
            nl: "Richtlijnen, hulpmiddelen, evenementen en nieuwsberichten",
          });
          websiteHeading.after(subtitle);
          // Add types to results
          websiteResults.querySelectorAll("a").forEach((element) => {
            let type: Translations;
            const url = element.getAttribute("href");
            if (
              url?.startsWith("/library/") ||
              url?.startsWith("/en/library/")
            ) {
              type = {
                en: "Page",
                nl: "Pagina",
              };
            } else if (
              url?.startsWith("/evenementen/") ||
              url?.startsWith("/en/events/")
            ) {
              type = {
                en: "Event",
                nl: "Evenement",
              };
            } else {
              type = {
                en: "News",
                nl: "Nieuwsbericht",
              };
            }
            // Remove existing label
            const existingLabel = element.querySelector(".label");
            existingLabel?.remove();
            const tag = document.createElement("p");
            tag.setAttribute("class", "label");
            tag.setAttribute(
              "style",
              `background-color: #00a6d6;
                color: white;
                border-radius: 50px;
                margin-bottom: 1em;
                padding: 0 1em;
                width: max-content`
            );
            tag.innerText = t(type);
            element?.prepend(tag);
          });
        }
        const websiteButton = websiteResults.querySelector(".btn");
        if (websiteButton) {
          websiteButton.textContent = t({
            en: "View all results",
            nl: "Bekijk alle resultaten",
          });
        }

        // Prepend result count
        websiteResults.prepend(
          websiteResultCount
            ? websiteResultCount
            : t({ en: "No results", nl: "Geen resultaten" })
        );
      }
    }

    // Create empty containers for search results
    searchProviders.forEach(async (provider, index) => {
      const container = document.createElement("div");
      container.className = "sm-6 md-6 lg-6";
      container.id = provider.id;
      container.innerHTML = html`
        <div class="t3ce frame-type-gridelements_pi1">
          <div class="grid-background--white grid-background--boxed">
            <span style="color:white">-</span>
            <h2>${t(provider.title)}</h2>
            <i>${t({ en: "Loading...", nl: "Aan het laden..." })}</i>
          </div>
        </div>
      `;
      if (index === 0) {
        // Place catalogue results before website results
        grid.prepend(container);
      } else {
        grid.append(container);
      }
      const records = await provider.getRecords(searchInput);
      const typoResults = createTypoResults(
        provider.title,
        provider.description,
        records,
        provider.searchBaseUrl + encodeURIComponent(searchInput)
      );
      container.innerHTML = typoResults;
    });
  }
}
