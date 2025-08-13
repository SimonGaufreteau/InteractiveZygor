import fs from "fs";

type PointData = {
  zone: string;
  x: number;
  y: number;
};

export function buildData(content: string): PointData[] {
  // Regex: optional zone, then x,y coordinates
  const pattern = /goto\s+(?:(\w+(?:\s\w+)*),)?(\d+\.\d+),(\d+\.\d+)/g;

  const data: PointData[] = [];
  let previousZone = "";

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    let [_, zone, x, y] = match;
    if (!zone) zone = previousZone;
    data.push({
      zone,
      x: parseFloat(x),
      y: parseFloat(y),
    });
    previousZone = zone;
  }

  return data;
}

const data = fs.readFileSync(
  "./VanillaEpochLeveling/src/epoch/zygor_guides/alliance/human1-13.zygor_guide",
  "utf8",
);

buildData(data);
