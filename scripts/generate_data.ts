import fs from "fs";
import { stringify } from "csv-stringify";
import type { ZonePoint } from "./types";

export function buildData(content: string): ZonePoint[] {
  // Regex: optional zone, then x,y coordinates
  const pattern = /goto\s+(?:(\w+(?:\s\w+)*),)?(\d+\.\d+),(\d+\.\d+)/g;

  const data: ZonePoint[] = [];
  let previousZone = "";

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    let [_, zone, x, y] = match;
    if (!zone) zone = previousZone;
    data.push({
      zone,
      point: {
        x: parseFloat(x),
        y: parseFloat(y),
      },
    });
    previousZone = zone;
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

const data = fs.readFileSync(
  "./VanillaEpochLeveling/src/epoch/zygor_guides/alliance/human1-13.zygor_guide",
  "utf8",
);

const points = buildData(data); //.filter((p) => p.zone == "Elwynn Forest");
write_to_file(points, "./public/points.csv");
