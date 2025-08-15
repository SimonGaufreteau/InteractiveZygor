import L from "leaflet";
import "leaflet-polylinedecorator";
import "./style.css";

import { loadMap, setTriggers } from "./map_utils";
import { loadPointsFromGuide, loadZones, rescalePointToMap } from "./loader";

function examplePoints(map: L.Map) {
  // Example points
  const pointA: L.LatLngExpression = [4000, 3000];
  const pointB: L.LatLngExpression = [9000, 8000];

  // Add markers
  L.marker(pointA).addTo(map).bindPopup("Point A");
  L.marker(pointB).addTo(map).bindPopup("Point B");

  // Draw arrow from A → B
  const line = L.polyline([pointA, pointB], { color: "red", weight: 1 }).addTo(
    map,
  );

  // Add arrowhead using PolylineDecorator
  // @ts-ignore - plugin extends L
  const arrow = L.polylineDecorator(line, {
    patterns: [
      {
        offset: "0%",
        repeat: 50,
        symbol: L.Symbol.arrowHead({
          pixelSize: 10,
          polygon: true,
          pathOptions: { fillOpacity: 1, color: "blue", weight: 0 },
        }),
      },
    ],
  }).addTo(map);
  return map;
}

const map = loadMap();
examplePoints(map);
setTriggers(map);

const zonePoints = await loadPointsFromGuide("/points.csv");
const zones = await loadZones("/zones.csv");
const rescaledPoints = zonePoints.map((zp) => rescalePointToMap(zp, zones));

rescaledPoints
  .filter((p) => p != undefined)
  .forEach((p) =>
    L.marker([p.y, p.x]).bindPopup(`Marker at ${p.x}, ${p.y}`).addTo(map),
  );
