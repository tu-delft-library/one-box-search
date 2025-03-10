// src/constants.ts
var djehutyBaseUrl = "https://data.4tu.nl/v2/articles/search";
var djehutySearchBaseUrl = "https://data.4tu.nl/search?search=";
var doiBaseUrl = "https://doi.org/";

// src/functions.ts
function fetchJson(url, body) {
  const method = body ? "POST" : "GET";
  const headers = new Headers;
  const options = { method, headers };
  if (body) {
    headers.append("Content-Type", "application/json");
    options.body = JSON.stringify(body);
  }
  const req = new Request(url, options);
  return fetch(req).then((response) => response.json());
}
function createTypoRow(props) {
  return `
    <a
      href="${doiBaseUrl + props.doi}"
      title="${props.title}"
      target="_top"
      class="news-summary"
    >
      <section>
        <h3>${props.title}</h3>
        <div class="row">
          <div class="sm-3"></div>
          <div class="sm-9">
            <p>Published at ${props.published_date}</p>
            <div class="fake-link">${props.doi}</div>
          </div>
        </div>
      </section>
    </a>
    `;
}
function createTypoResults(records, count, resultsUrl) {
  return `
    <div id="c1478060" class="t3ce frame-type-lookup_results">
      ${count ? "Top 3 results" : "No results"}
      <h2>4TU.ResearchData</h2>
      <div class="content-container">
        ${count ? records.map(createTypoRow).join(`
`) : ""} 
        <div id="c1534097" class="t3ce frame-type-sitetud_singlebutton">
          <a href="${resultsUrl}" class="btn btn--single align-center btn--royal_blue">
            View all results
          </a>
        </div>
      </div>
    </div>
    `;
}
function createContainer(content) {
  return `
    <div class="grid-background--white grid-background--boxed">
      <div class="row grid layout-0 grid--noPaddingBottom">
        <div class="sm-12">
          ${content}
        </div>
      </div>
    </div>
  `;
}
async function searchIn4tu(searchInput) {
  const records = await fetchJson(djehutyBaseUrl, { search_for: searchInput });
  const typoResults = createTypoResults(records.slice(0, 3), records.length, djehutySearchBaseUrl + searchInput);
  const container = createContainer(typoResults);
  const row = document.getElementsByClassName("sm-12 md-6")[1];
  if (row) {
    row.innerHTML = container;
  }
}

// index.ts
window.onload = () => {
  const { value } = document.getElementsByClassName("searchForm-input")[0];
  if (value) {
    searchIn4tu(value);
  }
};
