// src/constants.ts
var djehutyBaseUrl = "https://data.4tu.nl/v2/articles/search";
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
function createTypoResults(records) {
  return `
    <div id="c1478060" class="t3ce frame-type-lookup_results">
      <div class="content-container">
        ${records.map(createTypoRow).join(`
`)}
      </div>
    </div>
    `;
}
async function searchIn4tu(searchInput) {
  const records = await fetchJson(djehutyBaseUrl, { search_for: searchInput });
  const typoResults = createTypoResults(records);
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
