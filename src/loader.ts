import { CSVToArray } from "./csv-parser";

export async function loadPointsFromGuide(guide: string) {
  const rawPoints: string[][] = CSVToArray(await (await fetch(guide)).text());

  // TODO : Remove header line in parser
  rawPoints.shift();
  rawPoints.pop();

  const csvData = rawPoints.map((p) => ({
    x: Number.parseFloat(p[0]),
    y: Number.parseFloat(p[1]),
  }));

  return csvData;
}
