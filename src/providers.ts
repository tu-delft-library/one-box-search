import { fetchJson } from "./functions";
import { columnFilter } from "./search";
import type {
  NormalizedResults,
  DjehutySearchResult,
  RepositorySearchResult,
  WorldCatSearchResult,
  DatabaseNormalized,
} from "./types/types";

const displayCount = 3;

// Results appear on the page in the order below!
export default [
  {
    id: "catalogue",
    title: {
      en: "Catalogue",
      nl: "Catalogus",
    },
    description: {
      en: "Physical and digital books, media, journals",
      nl: "Fysieke en digitale boeken, media, tijdschriften",
    },
    apiBaseUrl: "https://handler.tudelft.nl/worldcat?type=brief&search=",
    searchBaseUrl: "https://tudelft.on.worldcat.org/search?queryString=",
    getRecords: async function (query: string) {
      try {
        // WorldCat doesn't accept an empty search string, using asterisk instead
        const response = await fetchJson(this.apiBaseUrl + (query || "*"));
        if (response) {
          const results = response.results as WorldCatSearchResult;
          if (results.briefRecords) {
            const normalizedResults: NormalizedResults = results.briefRecords
              .slice(0, displayCount)
              .map((d) => ({
                id: d.oclcNumber.toString(),
                title: d.title,
                authors: d.creator,
                href: "https://tudelft.on.worldcat.org/oclc/" + d.oclcNumber,
                date: d.date,
              }));
            normalizedResults.count = results.numberOfRecords;
            return normalizedResults;
          } else return null;
        } else return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
  },
  {
    id: "repository",
    title: {
      en: "TU Delft Repository",
      nl: "TU Delft Repository",
    },
    description: {
      en: "Digital archive of TU Delft output",
      nl: "Digitaal archief van TU Delft output",
    },
    apiBaseUrl:
      "https://repository.tudelft.nl/tudelft/library/search?limit=10&searchterm=",
    searchBaseUrl: "https://repository.tudelft.nl/search?search_term=",
    getRecords: async function (query: string) {
      try {
        const response = await fetchJson(this.apiBaseUrl + query);
        if (response) {
          const results = response.results as RepositorySearchResult;
          const count = +results.total;
          if (count && results.searchResults) {
            const normalizedResults: NormalizedResults = results.searchResults
              .slice(0, displayCount)
              .map((d) => ({
                id: d.thingid.replace("Thing_", "uuid:"),
                title: d.title,
                authors: d.contributors.map((c) => c.fullname).join(", "),
                href:
                  "https://repository.tudelft.nl/record/uuid:" +
                  d.thingid.replace("Thing_", ""),
                date: d.publication_year,
              }));
            normalizedResults.count = count;
            return normalizedResults;
          } else return null;
        } else return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
  },
  {
    id: "databases",
    title: {
      en: "Databases",
      nl: "Databases",
    },
    description: {
      en: "Recommended resources for the TU Delft community",
      nl: "Aanbevolen bronnen voor de TU Delft gemeenschap",
    },
    apiBaseUrl:
      "https://tu-delft-library.github.io/one-box-search/databases.json",
    searchBaseUrl: "https://databases.tudl.tudelft.nl/?t=az&q=",
    getRecords: async function (query: string) {
      try {
        const databases = await fetchJson(this.apiBaseUrl);
        if (databases) {
          const filter = columnFilter(["title", "keywords", "description"]);
          const results = query
            ? databases.results.filter(filter(query))
            : databases.results;
          const normalizedResults: NormalizedResults = results
            .slice(0, displayCount)
            .map((d: DatabaseNormalized) => ({
              title: d.title,
              description:
                d.description.split(" ").slice(0, 25).join(" ") + "...",
              href: d.url,
            }));
          normalizedResults.count = results.length;
          return normalizedResults;
        } else return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
  },
  {
    id: "research-data",
    title: {
      en: "Research Data (4TU)",
      nl: "Research Data (4TU)",
    },
    description: {
      en: "Research datasets, publications, and software",
      nl: "Onderzoeksdatasets, publicaties en software",
    },
    apiBaseUrl: "https://data.4tu.nl/v2/articles/search",
    searchBaseUrl: "https://data.4tu.nl/search?search=",
    getRecords: async function (query: string) {
      try {
        const response = await fetchJson(this.apiBaseUrl, {
          search_for: query,
        });
        if (response) {
          const results = response.results as DjehutySearchResult[];
          if (results) {
            const normalizedResults: NormalizedResults = results
              .slice(0, displayCount)
              .map((d) => ({
                id: d.doi,
                title: d.title,
                authors: d.authors.map((author) => author.full_name).join(", "),
                href: "https://doi.org/" + d.doi,
                date: d.published_date,
              }));
            // Getting count from response headers
            const countFromHeaders = response.headers.get("Number-Of-Records");
            normalizedResults.count = countFromHeaders
              ? +countFromHeaders
              : undefined;
            return normalizedResults;
          } else return null;
        } else return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
  },
  {
    // Todo: types for response
    id: "special-collections",
    title: {
      en: "Special Collections",
      nl: "Bijzondere Collecties",
    },
    description: {
      en: "Academic heritage, Trésor, Map room",
      nl: "Academisch erfgoed, Trésor, kaartenkamer",
    },
    apiBaseUrl:
      "https://63flhve71t2un5xgp.a1.typesense.net/multi_search?x-typesense-api-key=8EOitKCMTbxUKPZNqUEoQS9M2RGvpkZS",
    searchBaseUrl:
      "https://heritage.tudelft.nl/nl/search?production-manifests%5Bquery%5D=",
    getRecords: async function (query: string) {
      try {
        const response = await fetchJson(this.apiBaseUrl, {
          searches: [
            {
              query_by:
                "label,summary,type,plaintext,topic_material,topic_date,topic_contributor,topic_format",
              highlight_fields: "label,summary",
              highlight_start_tag: "<mark>",
              highlight_end_tag: "</mark>",
              highlight_full_fields:
                "label,summary,type,plaintext,topic_material,topic_date,topic_contributor,topic_format",
              collection: "production-manifests",
              q: query,
              facet_by:
                "topic_contributor,topic_date,topic_format,topic_material,type",
              max_facet_values: 10,
              page: 1,
            },
          ],
        });
        if (response) {
          const results = response.results;
          if (results) {
            const normalizedResults: NormalizedResults = results.results[0].hits
              .slice(0, displayCount)
              .map(({ document: d }) => ({
                id: d.slug,
                title: d.label,
                authors: d.topic_contributor
                  ? d.topic_contributor.join(", ")
                  : null,
                href: "https://heritage.tudelft.nl/" + d.slug,
                date: d.topic_date ? d.topic_date[0] : undefined,
              }));
            normalizedResults.count = results.results[0].found;
            return normalizedResults;
          } else return null;
        } else return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
  },
];
