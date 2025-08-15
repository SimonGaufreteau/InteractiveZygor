import { CSVToArray } from "./csv-parser";
import type { Point, ZonePoint } from "../scripts/types";

export async function loadPointsFromGuide(guide: string): Promise<ZonePoint[]> {
  const rawPoints: string[][] = CSVToArray(await (await fetch(guide)).text());

  // TODO : Remove header line in parser
  rawPoints.shift();
  rawPoints.pop();

  const csvData: ZonePoint[] = rawPoints.map((p) => ({
    zone: p[0],
    point: {
      x: Number.parseFloat(p[1]),
      y: Number.parseFloat(p[2]),
    },
  }));

  return csvData;
}

export async function loadZones(zonesPath: string): Promise<Map<string, Zone>> {
  const rawZones: string[][] = CSVToArray(
    await (await fetch(zonesPath)).text(),
  );
  // TODO : Remove header line in parser
  rawZones.shift();
  rawZones.pop();

  // TODO : Refactor this + duplicate function
  const csvData: Zone[] = rawZones.map((z) => ({
    name: z[0],
    topl_y: Number.parseFloat(z[1]),
    topl_x: Number.parseFloat(z[2]),
    bright_y: Number.parseFloat(z[3]),
    bright_x: Number.parseFloat(z[4]),
    orig_y: Number.parseFloat(z[5]),
    orig_x: Number.parseFloat(z[6]),
  }));

  const res = csvData.reduce((prev: Map<string, Zone>, current) => {
    return prev.set(current.name, current);
  }, new Map<string, Zone>());
  return res;
}

export function rescalePointToMap(
  zonePoint: ZonePoint,
  zones: Map<string, Zone>,
): Point | undefined {
  const zone = zones.get(zonePoint.zone);
  if (!zone) return undefined;
  const point = zonePoint.point;

  // Original scale : by how much we need to multiply the coordinates to get the pixel position
  const orig_scale_x = zone.orig_x / 100;
  const orig_scale_y = zone.orig_y / 100;
  // New scale : how much bigger the new map is * the original scaling
  const new_scale_x =
    (orig_scale_x * Math.abs(zone.bright_x - zone.topl_x)) / zone.orig_x;
  const new_scale_y =
    (orig_scale_y * Math.abs(zone.bright_y - zone.topl_y)) / zone.orig_y;

  return {
    x: zone.topl_x + point.x * new_scale_x,
    y: zone.topl_y - point.y * new_scale_y,
  };
}
