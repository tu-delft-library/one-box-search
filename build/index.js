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
      <div class="content-container">
        ${count ? "Top 10 results" : "No results"}
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
async function searchIn4tu(searchInput) {
  const records = await fetchJson(djehutyBaseUrl, { search_for: searchInput });
  const typoResults = createTypoResults(records.slice(0, 3), records.length, djehutySearchBaseUrl + searchInput);
  const container = document.getElementById("search-results-4tu");
  if (container) {
    container.innerHTML = typoResults;
  }
}

// index.ts
window.onload = () => {
  const { value } = document.getElementsByClassName("searchForm-input")[0];
  if (value) {
    searchIn4tu(value);
  }
};
