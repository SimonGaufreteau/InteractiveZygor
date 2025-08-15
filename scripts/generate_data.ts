import fs from "fs";
import { stringify } from "csv-stringify";
import type { ZonePoint } from "./types";

function convertGuideMapping(mappingPath: string) {
  const content = fs.readFileSync(mappingPath, "utf-8");
  const lines = content.split(/\r?\n/);

  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const [key, ...rest] = trimmed.split("=");
    if (!key) continue;

    result.push(key.trim() + ".csv");
  }
  return result;
}

function collectMatches(pattern: RegExp, text: string): string[] {
  const matches: string[] = [];
  let m;
  while ((m = pattern.exec(text)) !== null) {
    // Store the full matched text (trimmed)
    matches.push(m[0].trim());
  }
  return matches;
}

export function buildData(content: string): ZonePoint[] {
  // Regex: optional zone, then x,y coordinates
  // TODO : Currently this doesn't catch directives without coordinates like
  // goto Loch Modan|noway|c
  const pattern =
    /goto\s+(?:([^\d,\n]+?),)?(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)(?:,\d+)?/gi;
  // More lenient match used to check we have all the goto
  const check_pattern = /goto\s+([^,\n]+)?,?([\d.]+)?,?([\d.]+)?(?:,\d+)?/gi;
  const data: ZonePoint[] = [];
  let previousZone = "";
  const zoneset = new Set();

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    let [_, zone, x, y] = match;
    if (!zone) zone = previousZone;
    zoneset.add(zone);
    data.push({
      zone,
      point: {
        x: parseFloat(x),
        y: parseFloat(y),
      },
    });
    previousZone = zone;
  }
  const strictMatches = new Set(collectMatches(pattern, content));
  const looseMatches = collectMatches(check_pattern, content);

  // NOTE : There can be duplicates
  const missing = looseMatches.filter((line) => !strictMatches.has(line));

  if (missing.length > 0) {
    console.log(`\nStrict matches: ${strictMatches.size}`);
    console.log(`Loose matches:  ${looseMatches.length}`);
    console.log(`Missing from strict: ${missing.length}`);
    console.log("-----");
    console.log(missing.join("\n"));
  }

  return data;
}

function write_to_file(points: ZonePoint[], path: string): void {
  const columns = {
    zone: "zone",
    x: "x",
    y: "y",
  };

  stringify(
    points.map((p) => {
      return [p.zone, p.point.x, p.point.y];
    }),
    { header: true, columns: columns },
    (err, output) => {
      if (err) throw err;
      fs.writeFile(path, output, (err) => {
        if (err) throw err;
      });
    },
  );
}

// Convert the guides and write to public
const folder = "./VanillaEpochLeveling/src/epoch/zygor_guides/alliance/";
const guides: Map<string, string> = new Map();
fs.readdirSync(folder).forEach((file) => {
  guides.set(file, fs.readFileSync(folder + file));
});
guides
  .keys()
  // .filter((key: string) => key.startsWith("main50"))
  .forEach((key: string) =>
    write_to_file(
      buildData(guides.get(key)),
      `./public/${key.split(".")[0]}.csv`,
    ),
  );

// Convert the guide mapping to JSON and write to public
const mapping =
  "./VanillaEpochLeveling/src/epoch/zygor_guides/alliance_mapping.txt";
const mappingJson = convertGuideMapping(mapping);
fs.writeFileSync(
  "./public/mapping.json",
  JSON.stringify({ guides: mappingJson }, null, 2),
);
