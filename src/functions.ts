import { djehutyBaseUrl, djehutySearchBaseUrl, doiBaseUrl } from "./constants";

export function fetchJson(url: string, body: any) {
  const method = body ? "POST" : "GET";
  const headers = new Headers();
  const options: RequestInit = { method, headers };
  if (body) {
    headers.append("Content-Type", "application/json");
    options.body = JSON.stringify(body);
  }
  const req = new Request(url, options);
  return fetch(req).then((response) => response.json());
}

// Use preact? https://preactjs.com/
// Or: https://htmx.org/
function createTypoRow(props: any) {
  return /*html*/ `
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

function createTypoResults(records: any[], count: number, resultsUrl: string) {
  return /*html*/ `
    <div id="c1478060" class="t3ce frame-type-lookup_results">
      <div class="content-container">
        ${count ? "Top 10 results" : "No results"}
        ${count ? records.map(createTypoRow).join("\n") : ""} 
        <div id="c1534097" class="t3ce frame-type-sitetud_singlebutton">
          <a href="${resultsUrl}" class="btn btn--single align-center btn--royal_blue">
            View all results
          </a>
        </div>
      </div>
    </div>
    `;
}

export async function searchIn4tu(searchInput: string) {
  const records = await fetchJson(djehutyBaseUrl, { search_for: searchInput });
  const typoResults = createTypoResults(
    records.slice(0, 3),
    records.length,
    djehutySearchBaseUrl + searchInput
  );
  const container = document.getElementById("search-results-4tu");
  if (container) {
    // Potential security risk?
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Safely_inserting_external_content_into_a_page
    container.innerHTML = typoResults;
  }
}
