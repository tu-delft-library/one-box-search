import searchProviders from "./providers";

export function fetchJson(url: string, body?: any) {
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
    <div class="t3ce frame-type-lookup_results">
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
    `;
}

function createContainer() {
  return /*html*/ `
    <div class="grid-background--white grid-background--boxed">
      <div class="row grid layout-0 grid--noPaddingBottom">
        <div id="external-search-results" class="sm-12">
          <!-- Content will be placed here -->
        </div>
      </div>
    </div>
  `;
}

export async function createResults(searchInput: string) {
  const container = createContainer();
  const row = document.getElementsByClassName("sm-12 md-6")[1];
  if (row) {
    // Potential security risk?
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Safely_inserting_external_content_into_a_page
    row.innerHTML = container;
  }
   const resultDiv = document.getElementById("external-search-results");

  /* Previous version by Jules
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
      const div = document.createElement("div");
      div.innerHTML = typoResults;
      resultDiv?.appendChild(div);
    }
  });
*/ 

   // get what needs to be done...
  const recordPromises = searchProviders.map(async (provider) => {
    const records = await provider.getRecords(searchInput);
    return { provider, records };
  });
  
  // Wait for all queries, to all websites to resolve
  Promise.all(recordPromises).then((results) => {
    results.forEach(({ provider, records }) => {
      if (records) {
        const typoResults = createTypoResults(
          provider.title,
          records,
          records.count,
          provider.searchBaseUrl + searchInput
        );
        const div = document.createElement("div");
        div.innerHTML = typoResults;
        resultDiv?.appendChild(div);
      }
    });
  });


  
}
