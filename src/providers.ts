import { fetchJson } from "./functions";
import type {
  NormalizedResults,
  DjehutySearchResult,
  RepositorySearchResult,
  WorldCatSearchResult,
} from "./types/types";

const displayCount = 3;

export default [
  {
    title: "4TU.ResearchData",
    apiBaseUrl: "https://data.4tu.nl/v2/articles/search",
    searchBaseUrl: "https://data.4tu.nl/search?search=",
    getRecords: function (query: string) {
      return fetchJson(this.apiBaseUrl, { search_for: query })
        .then((resp: DjehutySearchResult[]) => {
          const normalizedResults: NormalizedResults = resp
            .slice(0, displayCount)
            .map((d) => ({
              id: d.doi,
              title: d.title,
              authors: null,
              href: "https://doi.org/" + d.doi,
              date: d.published_date,
            }));
          normalizedResults.count = undefined;
          return normalizedResults;
        })
        .catch((err) => console.log(err));
    },
  },
  {
    title: "WorldCat",
    apiBaseUrl: "https://sammeltassen-oclcsearchapi.web.val.run?q=",
    searchBaseUrl: "https://tudelft.on.worldcat.org/search?queryString=",
    getRecords: function (query: string) {
      return fetchJson(this.apiBaseUrl + query)
        .then((resp: WorldCatSearchResult) => {
          const normalizedResults: NormalizedResults = resp.briefRecords
            .slice(0, displayCount)
            .map((d) => ({
              id: d.oclcNumber.toString(),
              title: d.title,
              authors: d.creator,
              href: "https://tudelft.on.worldcat.org/oclc/" + d.oclcNumber,
              date: d.date,
            }));
          normalizedResults.count = resp.numberOfRecords;
          return normalizedResults;
        })
        .catch((err) => console.log(err));
    },
  },
  {
    title: "TU Delft Repository",
    apiBaseUrl:
      "https://repository.tudelft.nl/tudelft/library/search?limit=10&search_term=",
    searchBaseUrl: "https://repository.tudelft.nl/search?search_term=",
    getRecords: function (query: string) {
      return fetchJson(this.apiBaseUrl + query)
        .then((resp: RepositorySearchResult) => {
          const normalizedResults: NormalizedResults = resp.searchResults
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
          normalizedResults.count = +resp.total;
          return normalizedResults;
        })
        .catch((err) => console.log(err));
    },
  },
  {
    // Todo: types for response
    title: "Academic Heritage, History and Art",
    apiBaseUrl:
      "https://63flhve71t2un5xgp.a1.typesense.net/multi_search?x-typesense-api-key=8EOitKCMTbxUKPZNqUEoQS9M2RGvpkZS",
    searchBaseUrl:
      "https://heritage.tudelft.nl/nl/search?production-manifests%5Bquery%5D=",
    getRecords: function (query: string) {
      return fetchJson(this.apiBaseUrl, {
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
      })
        .then((resp) => {
          const normalizedResults: NormalizedResults = resp.results[0].hits
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
          normalizedResults.count = resp.out_of;
          return normalizedResults;
        })
        .catch((err) => console.log(err));
    },
  },
];
