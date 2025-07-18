import type { paths as WorldCatPaths } from "./worldcat-search-api.ts";

export type WorldCatSearchResult =
  WorldCatPaths["/brief-bibs"]["get"]["responses"][200]["content"]["application/json"];

export type DjehutySearchResult = {
  id: null;
  uuid: string;
  title: string;
  doi: string;
  handle: null;
  url: string;
  published_date: string;
  thumb: null;
  defined_type: number;
  defined_type_name: string;
  group_id: number;
  url_private_api: string;
  url_public_api: string;
  url_private_html: string;
  url_public_html: string;
  authors: {
    id: null | number;
    uuid: string;
    full_name: string;
    is_active: boolean;
    url_name: null | string;
    orcid_id: string;
  }[];
  timeline: {
    posted: string;
    firstOnline: string;
    revision: null;
  };
  resource_title: string;
  resource_doi: string;
};

export type RepositorySearchResult = {
  total: string;
  searchResults: [
    {
      thingid: string;
      search_priority: number;
      found_in: string;
      sc: string;
      search_score: number;
      ranking: number;
      title: string;
      title_bold: string;
      sub_title: string;
      sub_title_bold: string;
      description: string;
      description_bold: string;
      object_type: string;
      date_created: string;
      date_modified: string;
      publication_date: string;
      publication_year: string;
      contributors: [
        {
          id: number;
          personID: string;
          fullname: string;
        }
      ];
    }
  ];
  objectTypesReport: [
    {
      objectType: string;
      totalPerType: string;
      domains: string[];
    }
  ];
};

export type NormalizedResults = {
  id?: string;
  title?: string;
  authors?: string;
  description?: string;
  href?: string;
  date?: string;
}[] & { count?: undefined | number };

export type DatabaseMetadata = {
  ID: string;
  Title_corrected: string;
  Access_info: string;
  Abstract: string;
  Weblink_1: string;
  VKC_all: string;
  VKC_1: string;
  VKC_2: string;
  VKC_3: string;
  VKC_4: string;
  VKC_5: string;
  VKC_6: string;
  Information_type: string;
};

export type DatabaseNormalized = {
  title: string;
  access: string;
  url: string;
  keywords: string;
  description: string;
  disciplines: string[];
  type: string;
};

export type Translations = {
  en: string;
  nl: string;
};
