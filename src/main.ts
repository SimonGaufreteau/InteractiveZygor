import L from "leaflet";
import "leaflet-polylinedecorator";
import "./style.css";

import {
  drawLine,
  leafletToImageCoords,
  loadMap,
  markerIconFromColor,
  setTriggers,
} from "./map_utils";
import {
  loadGuideIndex,
  loadPointsFromGuide,
  loadZones,
  rescalePointToMap,
} from "./loader";
import { generateGradient } from "./color_utils";

// Map setup
const map = loadMap();
setTriggers(map);

// Points setup
const mapping = await loadGuideIndex();
const promises = mapping
  .filter((guide) => guide.startsWith("human"))
  .map(async (guide) => await loadPointsFromGuide(guide));
const zonePoints = await Promise.all(promises);
const zones = await loadZones("/zones.csv");
const rescaledPoints = zonePoints
  .flat()
  .map((zp) => rescalePointToMap(zp, zones))
  .filter((p) => p != undefined);

const colors = generateGradient(rescaledPoints.length);

rescaledPoints.forEach((p, index) => {
  const coords = leafletToImageCoords(p.y, p.x);
  return L.marker([coords.y, coords.x], {
    icon: markerIconFromColor(colors[index]),
  })
    .bindPopup(
      `Marker (${index}) at ${coords.x.toFixed(0)},${coords.y.toFixed(0)}`,
    )
    .addTo(map);
});

rescaledPoints.reduce((previous, current) =>
  previous != undefined ? drawLine(previous, current, map) && current : current,
);
