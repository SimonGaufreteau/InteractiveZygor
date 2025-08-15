import L from "leaflet";
import "leaflet-polylinedecorator";
import "./style.css";

import { loadMap, setTriggers } from "./map_utils";
import { loadPointsFromGuide } from "./loader";

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

const points = await loadPointsFromGuide("/points.csv");

// Elwynn Forest coordinates
const xTop = 8378;
const yTop = 3908;
const xBot = 10100;
const yBot = 2888;

// Original map size
const orig_x = 1000;
const orig_y = 668;
// Original scale : by how much we need to multiply the coordinates to get the pixel position
const orig_scale_x = orig_x / 100;
const orig_scale_y = orig_y / 100;
// New scale : how much bigger the new map is * the original scaling
const new_scale_x = (orig_scale_x * Math.abs(xBot - xTop)) / orig_x;
const new_scale_y = (orig_scale_y * Math.abs(yBot - yTop)) / orig_y;

points
  .map((p) => ({ x: xTop + p.x * new_scale_x, y: yTop - p.y * new_scale_y }))
  .forEach((p) =>
    L.marker([p.y, p.x]).bindPopup(`Marker at ${p.x}, ${p.y}`).addTo(map),
  );
