type WorldCatIndex = {
  format: string;
  tags: {
    x0: string;
    x4: string | null;
  };
  children: WorldCatIndex[] | null;
};

// https://github.com/rococodogs/worldcat-index/blob/master/worldcat-indicies.json
const jsonUrl =
  "https://raw.githubusercontent.com/rococodogs/worldcat-index/refs/heads/master/worldcat-indicies.json";

// Fetch JSON
const json = (await fetch(jsonUrl).then((resp) => resp.json())) as {
  indicies: WorldCatIndex[];
};

function remapIndex(index: WorldCatIndex) {
  const key = index.tags.x4 ? index.tags.x4 : index.tags.x0;
  const value = {};
  value.label = index.format;
  const children = index.children ? index.children.map(remapIndex) : null;
  if (children) {
    value.children = Object.fromEntries(children);
  }
  return [key, value];
}

const remap = Object.fromEntries(json.indicies.map(remapIndex));

// Write JSON
Bun.write("data/worldcat-types.json", JSON.stringify(remap, null, 2));
