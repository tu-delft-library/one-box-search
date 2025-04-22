// src/providers.ts
var displayCount = 3;
var providers_default = [
  {
    title: "4TU.ResearchData",
    apiBaseUrl: "https://data.4tu.nl/v2/articles/search",
    searchBaseUrl: "https://data.4tu.nl/search?search=",
    getRecords: async function(query) {
      const response = await fetchJson(this.apiBaseUrl, { search_for: query });
      if (response) {
        const results = response.results;
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
    }
  },
  {
    title: "WorldCat",
    apiBaseUrl: "https://sammeltassen-oclcsearchapi.web.val.run?q=",
    searchBaseUrl: "https://tudelft.on.worldcat.org/search?queryString=",
    getRecords: async function(query) {
      const response = await fetchJson(this.apiBaseUrl + query);
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
    }
  },
  {
    title: "TU Delft Repository",
    apiBaseUrl: "https://repository.tudelft.nl/tudelft/library/search?limit=10&searchterm=",
    searchBaseUrl: "https://repository.tudelft.nl/search?search_term=",
    getRecords: async function(query) {
      const response = await fetchJson(this.apiBaseUrl + query);
      if (response) {
        const results = response.results;
        const normalizedResults = results.searchResults.slice(0, displayCount).map((d) => ({
          id: d.thingid.replace("Thing_", "uuid:"),
          title: d.title,
          authors: d.contributors.map((c) => c.fullname).join(", "),
          href: "https://repository.tudelft.nl/record/uuid:" + d.thingid.replace("Thing_", ""),
          date: d.publication_year
        }));
        normalizedResults.count = +results.total;
        return normalizedResults;
      } else
        return null;
    }
  },
  {
    title: "Academic Heritage, History and Art",
    apiBaseUrl: "https://63flhve71t2un5xgp.a1.typesense.net/multi_search?x-typesense-api-key=8EOitKCMTbxUKPZNqUEoQS9M2RGvpkZS",
    searchBaseUrl: "https://heritage.tudelft.nl/nl/search?production-manifests%5Bquery%5D=",
    getRecords: async function(query) {
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
    }
  }
];

// src/functions.ts
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
  return `
    <a
      href="${props.href}"
      title="${props.title}"
      target="_top"
      class="news-summary"
    >
      <section>
        <h3>${props.title}</h3>
        <div class="row">
          <div class="sm-3"></div>
          <div class="sm-9">
            ${props.authors ? "<p>" + props.authors + "</p>" : ""} 
            ${props.date ? "<p>Published " + props.date + "</p>" : ""}
            <div class="fake-link">${props.id}</div>
          </div>
        </div>
      </section>
    </a>
    `;
}
function createTypoResults(title, records, count, resultsUrl) {
  return `
    <div class="t3ce frame-type-gridelements_pi1">
      <div class="grid-background--white grid-background--boxed">
        ${records.length && count ? count + " results" : records.length ? "Top 3 results" : "No results"}
        <h2>${title}</h2>
        <div class="content-container">
          ${records.length ? records.map(createTypoRow).join(`
`) : ""} 
          <div class="t3ce frame-type-sitetud_singlebutton">
            <a href="${resultsUrl}" class="btn btn--single align-center btn--royal_blue">
              View all results
            </a>
          </div>
        </div>
      </div>
    </div>
    `;
}
async function createResults(searchInput) {
  const grid = document.getElementsByClassName("multiRowGrid")[0];
  providers_default.map(async (provider) => {
    const records = await provider.getRecords(searchInput);
    if (records) {
      const typoResults = createTypoResults(provider.title, records, records.count, provider.searchBaseUrl + searchInput);
      const div = document.createElement("div");
      div.className = "sm-6 md-6 lg-6";
      div.innerHTML = typoResults;
      if (grid) {
        grid.appendChild(div);
      }
    }
  });
}

// index.ts
window.onload = () => {
  const { value } = document.getElementsByClassName("searchForm-input")[0];
  if (value) {
    createResults(value);
  }
};
