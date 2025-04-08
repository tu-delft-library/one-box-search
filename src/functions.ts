import searchProviders from "./providers";

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
function createTypoRow(props: any) {
  return /*html*/ `
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

function createTypoResults(
  title: string,
  records: any[],
  count: number | undefined,
  resultsUrl: string
) {
  return /*html*/ `
    <div class="t3ce frame-type-gridelements_pi1">
      <div class="grid-background--white grid-background--boxed">
        ${
          records.length && count
            ? count + " results"
            : records.length
            ? "Top 3 results"
            : "No results"
        }
        <h2>${title}</h2>
        <div class="content-container">
          ${records.length ? records.map(createTypoRow).join("\n") : ""} 
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

export async function createResults(searchInput: string) {
  // Get flex container
  const grid = document.getElementsByClassName("multiRowGrid")[0];

  // Add results to container
  searchProviders.map(async (provider) => {
    const records = await provider.getRecords(searchInput);
    if (records) {
      const typoResults = createTypoResults(
        provider.title,
        records,
        records.count,
        provider.searchBaseUrl + searchInput
      );
      // Create flex child
      const div = document.createElement("div");
      div.className = "sm-6 md-6 lg-6";
      // Potential security risk?
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Safely_inserting_external_content_into_a_page
      div.innerHTML = typoResults;
      if (grid) {
        grid.appendChild(div);
      }
    }
  });
}
