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
// data/worldcat-types.json
var worldcat_types_default = {
  Archv: {
    label: "Archival Material",
    children: {
      Digital: {
        label: "Downloadable Archival Material"
      }
    }
  },
  ArtChap: {
    label: "Article",
    children: {
      Chmpt: {
        label: "Chapter"
      },
      Digital: {
        label: "Downloadable article"
      }
    }
  },
  Audiobook: {
    label: "Audiobook",
    children: {
      CD: {
        label: "CD"
      },
      Digital: {
        label: "eAudiobook"
      },
      LP: {
        label: "LP"
      },
      Cassette: {
        label: "Cassette"
      }
    }
  },
  Book: {
    label: "Book",
    children: {
      Braille: {
        label: "Braille"
      },
      Continuing: {
        label: "Continually Updated Resource"
      },
      Digital: {
        label: "eBook"
      },
      LargePrint: {
        label: "Large Print"
      },
      mic: {
        label: "Microform"
      },
      thsis: {
        label: "Thesis/Dissertation"
      }
    }
  },
  CompFile: {
    label: "Computer File"
  },
  Encyc: {
    label: "Encyclopedia"
  },
  Game: {
    label: "Game",
    children: {
      Digital: {
        label: "Video Game"
      }
    }
  },
  "2d": {
    label: "Image"
  },
  IntMM: {
    label: "Interactive Multimedia"
  },
  Web: {
    label: "Internet Resource",
    children: {
      Digital: {
        label: "Website"
      },
      dwn2d: {
        label: "Downloadable Image"
      }
    }
  },
  Jrnl: {
    label: "Journal/Magazine",
    children: {
      Digital: {
        label: "eJournal/eMagazine"
      }
    }
  },
  Kit: {
    label: "Kit"
  },
  Map: {
    label: "Map",
    children: {
      Digital: {
        label: "eMap"
      }
    }
  },
  Music: {
    label: "Music",
    children: {
      CD: {
        label: "CD"
      },
      Digital: {
        label: "eMusic"
      },
      LP: {
        label: "LP"
      },
      Cassette: {
        label: "Cassette"
      }
    }
  },
  MsScr: {
    label: "Musical Score",
    children: {
      Digital: {
        label: "Downloadable Music Score"
      }
    }
  },
  News: {
    label: "Newspaper",
    children: {
      Digital: {
        label: "eNewspaper"
      }
    }
  },
  Object: {
    label: "Object"
  },
  Snd: {
    label: "Sound Recording (Other)"
  },
  Toy: {
    label: "Toy"
  },
  Video: {
    label: "Video",
    children: {
      Bluray: {
        label: "Bluray"
      },
      Digital: {
        label: "eVideo"
      },
      DVD: {
        label: "DVD"
      },
      Film: {
        label: "Film"
      },
      VHS: {
        label: "VHS"
      }
    }
  },
  Vis: {
    label: "Visual material",
    children: {
      Digital: {
        label: "Downloadable Visual Material"
      }
    }
  }
};

// src/providers.ts
var displayCount = 3;
var noResults = (err) => {
  const arr = new Array;
  arr.count = 0;
  if (err) {
    console.error(err);
    arr.error = true;
  }
  return arr;
};
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
        const encodedQuery = encodeURIComponent(query);
        const response = await fetchJson(this.apiBaseUrl + (encodedQuery || "*"));
        if (response) {
          const results = response.results;
          if (results.briefRecords) {
            let parseType = function(generalFormat, specificFormat) {
              if (!generalFormat)
                return;
              const type = worldcat_types_default[generalFormat];
              const specificType = type.children[specificFormat];
              if (specificType) {
                return specificType?.label;
              }
              return type?.label;
            };
            const normalizedResults = results.briefRecords.slice(0, displayCount).map((d) => ({
              id: d.oclcNumber.toString(),
              title: d.title,
              authors: d.creator,
              href: "https://tudelft.on.worldcat.org/oclc/" + d.oclcNumber,
              date: d.date,
              type: parseType(d.generalFormat, d.specificFormat)
            }));
            normalizedResults.count = results.numberOfRecords;
            return normalizedResults;
          } else
            return noResults();
        } else
          return noResults();
      } catch (err) {
        return noResults(err);
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
        const response = await fetchJson(this.apiBaseUrl + encodeURIComponent(query));
        if (response) {
          const results = response.results;
          const count = +results.total;
          const ifResults = results.searchResults && Array.isArray(results.searchResults);
          if (count && ifResults) {
            const normalizedResults = results.searchResults.slice(0, displayCount).map((d) => ({
              id: d.thingid.replace("Thing_", "uuid:"),
              title: d.title,
              authors: d.contributors.map((c) => c.fullname).join(", "),
              href: "https://repository.tudelft.nl/record/uuid:" + d.thingid.replace("Thing_", ""),
              date: d.publication_year,
              type: d.object_type
            }));
            normalizedResults.count = count;
            return normalizedResults;
          } else
            return noResults();
        } else
          return noResults();
      } catch (err) {
        return noResults(err);
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
    apiBaseUrl: "https://filelist.tudelft.nl/Library/Zoeken/databases.json",
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
            href: d.url,
            type: d.type
          }));
          normalizedResults.count = results.length;
          return normalizedResults;
        } else
          return noResults();
      } catch (err) {
        return noResults(err);
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
              date: new Date(d.published_date).getFullYear().toString(),
              type: d.defined_type_name
            }));
            const countFromHeaders = response.headers.get("Number-Of-Records");
            normalizedResults.count = countFromHeaders ? +countFromHeaders : undefined;
            return normalizedResults;
          } else
            return noResults();
        } else
          return noResults();
      } catch (err) {
        return noResults(err);
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
              page: 1,
              sort_by: !query ? "_rand():asc" : ""
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
              date: d.topic_date ? d.topic_date[0] : undefined,
              type: d.type,
              image: d.thumbnail ? d.thumbnail.replace("1024,", "!200,200") : null
            }));
            normalizedResults.count = results.results[0].found;
            return normalizedResults;
          } else
            return noResults();
        } else
          return noResults();
      } catch (err) {
        return noResults(err);
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
        ${props.type ? `<p class="label" style="${typeStyle}">` + props.type + "</p>" : ""}
        <h3>${props.title}</h3>
        <div class="row">
          <div class="sm-3">
            ${props.image ? `
            <picture>
              <source media="(max-width: 600px)" srcset="${props.image}">
              <img alt="${props.title}" src="${props.image}">
            </picture>
            ` : ""}
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
function createTypoResults(title, description, records, resultsUrl) {
  const { count, error } = records;
  return html`
    <div class="t3ce frame-type-gridelements_pi1">
      <div class="grid-background--white grid-background--boxed">
        ${records && records.length && count ? count.toLocaleString() + t({ en: " results", nl: " resultaten" }) : records && records.length ? t({ en: "Top 3 results", nl: "Top 3 resultaten" }) : error ? t({
    en: "Results could not be fetched",
    nl: "Resultaten konden niet geladen worden"
  }) : t({ en: "No results", nl: "Geen resultaten" })}
        <h2>${t(title)}</h2>
        <p><i>${t(description)}</i></p>
        <div class="content-container">
          ${records && records.length ? records.map(createTypoRow).join(`
`) : error ? `<div class="news-summary" style="color:#e64616">` + t({
    en: "Access results through the button below",
    nl: "Toegang tot de resultaten via onderstaande knop"
  }) + "</div>" : ""}
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
          websiteResults.querySelectorAll("a").forEach((element) => {
            let type;
            const url = element.getAttribute("href");
            if (url?.startsWith("/library/") || url?.startsWith("/en/library/")) {
              type = {
                en: "Page",
                nl: "Pagina"
              };
            } else if (url?.startsWith("/evenementen/") || url?.startsWith("/en/events/")) {
              type = {
                en: "Event",
                nl: "Evenement"
              };
            } else {
              type = {
                en: "News",
                nl: "Nieuwsbericht"
              };
            }
            const existingLabel = element.querySelector(".label");
            existingLabel?.remove();
            const tag = document.createElement("p");
            tag.setAttribute("class", "label");
            tag.setAttribute("style", `background-color: #00a6d6;
                color: white;
                border-radius: 50px;
                margin-bottom: 1em;
                padding: 0 1em;
                width: max-content`);
            tag.innerText = t(type);
            element?.prepend(tag);
          });
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
      const typoResults = createTypoResults(provider.title, provider.description, records, provider.searchBaseUrl + encodeURIComponent(searchInput));
      container.innerHTML = typoResults;
    });
  }
}

// src/index.ts
window.onload = () => {
  let value = "";
  const searchElement = document.querySelector(".searchForm-input");
  value = searchElement.value;
  const language2 = document.documentElement.lang || "en";
  document.documentElement.style.setProperty("scroll-behavior", "smooth");
  createResults(value, language2);
};
