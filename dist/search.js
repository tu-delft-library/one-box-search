// src/search.ts
function columnFilter(columns) {
  return (query) => {
    const filters = `${query}`.split(/\s+/g).filter((t) => t).map(termFilter);
    return (d) => {
      out:
        for (const filter of filters) {
          for (const column of columns) {
            if (filter.test(d[column])) {
              continue out;
            }
          }
          return false;
        }
      return true;
    };
  };
}
function termFilter(term) {
  return new RegExp(`(?:^|[^\\p{L}-])${escapeRegExp(term)}`, "iu");
}
function escapeRegExp(text) {
  return text.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

// src/providers.ts
var displayCount = 3;
var providers_default = [
  {
    id: "catalogue",
    title: {
      en: "Catalogue",
      nl: "Catalogus"
    },
    description: {
      en: "Physical and digital books, media, journals",
      nl: "Fysieke en digitale boeken, media, tijdschriften"
    },
    apiBaseUrl: "https://handler.tudelft.nl/worldcat?type=brief&search=",
    searchBaseUrl: "https://tudelft.on.worldcat.org/search?queryString=",
    getRecords: async function(query) {
      try {
        const response = await fetchJson(this.apiBaseUrl + (query || "*"));
        if (response) {
          const results = response.results;
          if (results.briefRecords) {
            const normalizedResults = results.briefRecords.slice(0, displayCount).map((d) => ({
              id: d.oclcNumber.toString(),
              title: d.title,
              authors: d.creator,
              href: "https://tudelft.on.worldcat.org/oclc/" + d.oclcNumber,
              date: d.date
            }));
            normalizedResults.count = results.numberOfRecords;
            return normalizedResults;
          } else
            return null;
        } else
          return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  },
  {
    id: "repository",
    title: {
      en: "TU Delft Repository",
      nl: "TU Delft Repository"
    },
    description: {
      en: "Digital archive of TU Delft output",
      nl: "Digitaal archief van TU Delft output"
    },
    apiBaseUrl: "https://repository.tudelft.nl/tudelft/library/search?limit=10&searchterm=",
    searchBaseUrl: "https://repository.tudelft.nl/search?search_term=",
    getRecords: async function(query) {
      try {
        const response = await fetchJson(this.apiBaseUrl + query);
        if (response) {
          const results = response.results;
          const count = +results.total;
          if (count && results.searchResults) {
            const normalizedResults = results.searchResults.slice(0, displayCount).map((d) => ({
              id: d.thingid.replace("Thing_", "uuid:"),
              title: d.title,
              authors: d.contributors.map((c) => c.fullname).join(", "),
              href: "https://repository.tudelft.nl/record/uuid:" + d.thingid.replace("Thing_", ""),
              date: d.publication_year
            }));
            normalizedResults.count = count;
            return normalizedResults;
          } else
            return null;
        } else
          return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  },
  {
    id: "databases",
    title: {
      en: "Databases",
      nl: "Databases"
    },
    description: {
      en: "Recommended resources for the TU Delft community",
      nl: "Aanbevolen bronnen voor de TU Delft gemeenschap"
    },
    apiBaseUrl: "https://tu-delft-library.github.io/one-box-search/databases.json",
    searchBaseUrl: "https://databases.tudl.tudelft.nl/?t=az&q=",
    getRecords: async function(query) {
      try {
        const databases = await fetchJson(this.apiBaseUrl);
        if (databases) {
          const filter = columnFilter(["title", "keywords", "description"]);
          const results = query ? databases.results.filter(filter(query)) : databases.results;
          const normalizedResults = results.slice(0, displayCount).map((d) => ({
            title: d.title,
            description: d.description.split(" ").slice(0, 25).join(" ") + "...",
            href: d.url
          }));
          normalizedResults.count = results.length;
          return normalizedResults;
        } else
          return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  },
  {
    id: "research-data",
    title: {
      en: "Research Data (4TU)",
      nl: "Research Data (4TU)"
    },
    description: {
      en: "Research datasets, publications, and software",
      nl: "Onderzoeksdatasets, publicaties en software"
    },
    apiBaseUrl: "https://data.4tu.nl/v2/articles/search",
    searchBaseUrl: "https://data.4tu.nl/search?search=",
    getRecords: async function(query) {
      try {
        const response = await fetchJson(this.apiBaseUrl, {
          search_for: query
        });
        if (response) {
          const results = response.results;
          if (results) {
            const normalizedResults = results.slice(0, displayCount).map((d) => ({
              id: d.doi,
              title: d.title,
              authors: d.authors.map((author) => author.full_name).join(", "),
              href: "https://doi.org/" + d.doi,
              date: d.published_date
            }));
            const countFromHeaders = response.headers.get("Number-Of-Records");
            normalizedResults.count = countFromHeaders ? +countFromHeaders : undefined;
            return normalizedResults;
          } else
            return null;
        } else
          return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  },
  {
    id: "special-collections",
    title: {
      en: "Special Collections",
      nl: "Bijzondere Collecties"
    },
    description: {
      en: "Academic heritage, Trésor, Map room",
      nl: "Academisch erfgoed, Trésor, kaartenkamer"
    },
    apiBaseUrl: "https://63flhve71t2un5xgp.a1.typesense.net/multi_search?x-typesense-api-key=8EOitKCMTbxUKPZNqUEoQS9M2RGvpkZS",
    searchBaseUrl: "https://heritage.tudelft.nl/nl/search?production-manifests%5Bquery%5D=",
    getRecords: async function(query) {
      try {
        const response = await fetchJson(this.apiBaseUrl, {
          searches: [
            {
              query_by: "label,summary,type,plaintext,topic_material,topic_date,topic_contributor,topic_format",
              highlight_fields: "label,summary",
              highlight_start_tag: "<mark>",
              highlight_end_tag: "</mark>",
              highlight_full_fields: "label,summary,type,plaintext,topic_material,topic_date,topic_contributor,topic_format",
              collection: "production-manifests",
              q: query,
              facet_by: "topic_contributor,topic_date,topic_format,topic_material,type",
              max_facet_values: 10,
              page: 1
            }
          ]
        });
        if (response) {
          const results = response.results;
          if (results) {
            const normalizedResults = results.results[0].hits.slice(0, displayCount).map(({ document: d }) => ({
              id: d.slug,
              title: d.label,
              authors: d.topic_contributor ? d.topic_contributor.join(", ") : null,
              href: "https://heritage.tudelft.nl/" + d.slug,
              date: d.topic_date ? d.topic_date[0] : undefined
            }));
            normalizedResults.count = results.results[0].found;
            return normalizedResults;
          } else
            return null;
        } else
          return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  }
];

// src/functions.ts
var html = (strings, ...values) => String.raw({ raw: strings }, ...values);
var language = undefined;
var t = (translations) => language === "nl" ? translations.nl : translations.en;
function fetchJson(url, body) {
  const method = body ? "POST" : "GET";
  const headers = new Headers;
  const options = { method, headers };
  headers.append("Accept", "application/json");
  if (body) {
    headers.append("Content-Type", "application/json");
    options.body = JSON.stringify(body);
  }
  const req = new Request(url, options);
  return fetch(req).then((response) => {
    if (response.ok) {
      const { headers: headers2 } = response;
      return response.json().then((results) => ({ headers: headers2, results }));
    } else
      return null;
  });
}
function createTypoRow(props) {
  return html`
    <a
      href="${props.href}"
      title="${props.title}"
      target="_blank"
      class="news-summary"
    >
      <section>
        <h3>${props.title}</h3>
        <div class="row">
          <div class="sm-3"></div>
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
function createTypoResults(title, description, records, count, resultsUrl) {
  return html`
    <div class="t3ce frame-type-gridelements_pi1">
      <div class="grid-background--white grid-background--boxed">
        ${records && records.length && count ? count.toLocaleString() + " " + t({ en: "results", nl: "resultaten" }) : records && records.length ? t({ en: "Top 3 results", nl: "Top 3 resultaten" }) : t({ en: "No results", nl: "Geen resultaten" })}
        <h2>${t(title)}</h2>
        <p><i>${t(description)}</i></p>
        <div class="content-container">
          ${records && records.length ? records.map(createTypoRow).join(`
`) : ""}
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
var createSearchSubtitle = () => {
  return html`<div
    class="t3ce frame-type-text"
    style="margin-bottom:-20px;margin-top:15px;"
  >
    ${t({
    en: "Search gives results from",
    nl: "Zoeken geeft resultaten uit"
  })}
    <a href="#website"
      ><b>${t({ en: "this website", nl: "deze website" })}</b></a
    >,
    ${providers_default.map(({ id, title }) => html`<a href="#${id}"><b>${t(title)}</b></a>`).join(", ")}.
  </div>`;
};
async function createResults(searchInput, languageInput) {
  language = languageInput;
  const grid = document.querySelector(".multiRowGrid");
  if (grid) {
    const searchBox = document.querySelector("div.hiddenSidebarContent");
    if (searchBox) {
      const websiteResultCount = searchBox.innerHTML.split("</form>")[1].trim();
      const subtitle = createSearchSubtitle();
      searchBox.innerHTML = searchBox.innerHTML.split("</form>")[0] + subtitle;
      const websiteResults = grid.querySelector(".sm-12");
      if (websiteResults) {
        websiteResults.id = "website";
        const websiteHeading = websiteResults.querySelector("h2");
        if (websiteHeading) {
          websiteHeading.textContent = t({
            en: "This website",
            nl: "Deze website"
          });
          const subtitle2 = document.createElement("p");
          subtitle2.style.fontStyle = "italic";
          subtitle2.innerText = t({
            en: "Guidelines, tools, events, news",
            nl: "Richtlijnen, hulpmiddelen, evenementen en nieuwsberichten"
          });
          websiteHeading.after(subtitle2);
        }
        const websiteButton = websiteResults.querySelector(".btn");
        if (websiteButton) {
          websiteButton.textContent = t({
            en: "View all results",
            nl: "Bekijk alle resultaten"
          });
        }
        websiteResults.prepend(websiteResultCount ? websiteResultCount : t({ en: "No results", nl: "Geen resultaten" }));
      }
    }
    providers_default.forEach(async (provider, index) => {
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
        grid.prepend(container);
      } else {
        grid.append(container);
      }
      const records = await provider.getRecords(searchInput);
      const typoResults = createTypoResults(provider.title, provider.description, records, records?.count, provider.searchBaseUrl + searchInput);
      container.innerHTML = typoResults;
    });
  }
}

// src/index.ts
window.onload = () => {
  const { value } = document.querySelector(".searchForm-input");
  const language2 = document.documentElement.lang || "en";
  document.documentElement.style.setProperty("scroll-behavior", "smooth");
  createResults(value, language2);
};
