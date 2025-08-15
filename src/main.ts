import L from "leaflet";
import "leaflet-polylinedecorator";
import "./style.css";

import { leafletToImageCoords, loadMap, setTriggers } from "./map_utils";
import {
  loadGuideIndex,
  loadPointsFromGuide,
  loadZones,
  rescalePointToMap,
} from "./loader";

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

// Map setup
const map = loadMap();
examplePoints(map);
setTriggers(map);

// Points setup
const mapping = await loadGuideIndex();
const promises = mapping.map(async (guide) => await loadPointsFromGuide(guide));
const zonePoints = await Promise.all(promises);
const zones = await loadZones("/zones.csv");
const rescaledPoints = zonePoints
  .flat()
  .map((zp) => rescalePointToMap(zp, zones));

rescaledPoints
  .filter((p) => p != undefined)
  .forEach((p) => {
    const coords = leafletToImageCoords(p.y, p.x);
    return L.marker([coords.y, coords.x])
      .bindPopup(`Marker at ${coords.x.toFixed(0)},${coords.y.toFixed(0)}`)
      .addTo(map);
  });
