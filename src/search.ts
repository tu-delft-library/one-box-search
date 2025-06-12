// From: https://github.com/observablehq/inputs/blob/main/src/search.js

// Copyright 2021–2024 Observable, Inc.
// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that the above copyright notice
// and this permission notice appear in all copies.

export function searchFilter(query: string) {
  const filters = `${query}`
    .split(/\s+/g)
    .filter((t) => t)
    .map(termFilter);
  return (d: any) => {
    if (d == null) return false;
    if (typeof d === "object") {
      out: for (const filter of filters) {
        for (const value of valuesof(d)) {
          if (filter.test(value)) {
            continue out;
          }
        }
        return false;
      }
    } else {
      for (const filter of filters) {
        if (!filter.test(d)) {
          return false;
        }
      }
    }
    return true;
  };
}

export function columnFilter(columns: string[]) {
  return (query: string) => {
    const filters = `${query}`
      .split(/\s+/g)
      .filter((t) => t)
      .map(termFilter);
    return (d: any) => {
      out: for (const filter of filters) {
        for (const column of columns) {
          if (filter.test(d[column])) {
            continue out;
          }
        }
        return false;
      }
      return true;
    };
  };
}

function* valuesof(d: { [key: string]: any }) {
  for (const key in d) {
    yield d[key];
  }
}

function termFilter(term: string) {
  return new RegExp(`(?:^|[^\\p{L}-])${escapeRegExp(term)}`, "iu");
}

function escapeRegExp(text: string) {
  return text.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}
