import { csv2json } from "json-2-csv";
import type { DatabaseMetadata } from "./src/types/types";

const csvUrl =
  "https://databases.tudl.tudelft.nl/wp-content/uploads/sites/20/databases_content_metadata.csv";

// Fetch CSV
const csv = await fetch(csvUrl).then((resp) => resp.text());

// Write CSV
// Bun.write("data/databases.csv", csv);

// Convert CSV to JSON
let databases = csv2json(csv, {
  delimiter: {
    field: ";",
  },
  trimFieldValues: true,
  trimHeaderFields: true,
}) as DatabaseMetadata[];

// Write unprocessed JSON
// Bun.write("data/databases-raw.json", JSON.stringify(databases, null, 4));

// const allDisciplines = new Array();

const normalizedDatabases = databases.map((d, index) => {
  const [_, keywords, description] = d.Abstract.split("\r\n");
  let disciplines = [d.VKC_1, d.VKC_2, d.VKC_3, d.VKC_4, d.VKC_5, d.VKC_6];
  disciplines = disciplines.filter((d) => d && d !== "All VKCs");
  // allDisciplines.push(...disciplines);
  if (!disciplines.length) {
    disciplines.push("All");
  }
  return {
    title: d.Title_corrected,
    access: d.Access_info,
    url: d.Weblink_1.split("#")[1],
    keywords,
    description,
    disciplines,
    type: d.Information_type,
  };
});

// const uniqueDisciplines = [...new Set(allDisciplines)];
// console.log(uniqueDisciplines);

// Extract all URLs
// const urls = normalizedDatabases.map((d) => d.url);
// Bun.write("data/urls.txt", urls.join("\n"));

// Extract all types
// const urls = new Set(normalizedDatabases.map((d) => d.type));
// Bun.write("data/types.txt", [...urls].join("\n"));

// Write output
Bun.write("data/databases.json", JSON.stringify(normalizedDatabases, null, 4));
