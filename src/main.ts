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
import type { Point } from "../scripts/types";

// Dynamic guide display variables
let currentGuide: Point[] = []; // All the points for the current guide
let guideIndex = 0; // Current point displayed (the first point is always displayed)
let loadedMarkers: L.Marker[] = []; // Markers currently displayed on the map
let loadedLines: Map<L.Marker, [L.Polyline, L.polylineDecorator]> = new Map(); // Lines displayed on the map (the END MARKER is the reference for the line)

// Show the point on the map and add it to the loadedMarkers
function showStep(point: Point, map: L.Map) {
  const coords = leafletToImageCoords(point.y, point.x);

  const marker = L.marker([coords.y, coords.x], {
    icon: markerIconFromColor("#ff0000"),
  })
    .addTo(map)
    .bindPopup(`Step ${guideIndex + 1}`)
    .openPopup();

  loadedMarkers.push(marker);
  // Center map on marker
  map.setView([coords.y, coords.x], map.getZoom());
}

function getCurrentMarker() {
  const l = loadedMarkers.length;
  return l > 0 ? loadedMarkers[loadedMarkers.length - 1] : undefined;
}

function clearMap() {
  loadedMarkers.forEach((marker) => marker.remove());
  loadedMarkers = [];
  loadedLines.forEach(
    ([line, decorator]) => line.remove() && decorator.remove(),
  );
  loadedLines.clear();
}

// Main function called in index.html
async function init() {
  const map = loadMap();
  setTriggers(map);
  map.invalidateSize();

  // Load index + zones
  const mapping = await loadGuideIndex();
  const zones = await loadZones("/zones.csv");

  // Sidebar guide list
  const guideList = document.getElementById("guide-list")!;
  mapping.forEach((guide) => {
    const li = document.createElement("li");
    li.textContent = guide;
    li.style.cursor = "pointer";
    li.onclick = async () => {
      // Reset
      currentGuide = [];
      guideIndex = 0;
      clearMap();

      // Load this guide
      const points = await loadPointsFromGuide(guide);
      currentGuide = points
        .map((zp) => rescalePointToMap(zp, zones))
        .filter((p) => p != undefined);

      showStep(currentGuide[0], map);
      // Show controls
      document.getElementById("controls")!.style.display = "block";
    };
    guideList.appendChild(li);
  });

  // Controls
  document.getElementById("forward")!.onclick = () => {
    if (currentGuide.length === 0) return;
    if (guideIndex < currentGuide.length - 1) {
      guideIndex++;
      const currentPoint = currentGuide[guideIndex];
      const prevPoint = currentGuide[guideIndex - 1];
      showStep(currentPoint, map);
      loadedLines.set(currentPoint, drawLine(prevPoint, currentPoint, map));
    }
  };

  document.getElementById("back")!.onclick = () => {
    if (currentGuide.length === 0) return;
    if (guideIndex > 0) {
      guideIndex--;
      const lastMarker = loadedMarkers.pop();
      lastMarker.remove();
      const line = loadedLines.get(lastMarker);
      line.remove();
      loadedLines.delete(lastMarker);
    }
    const prevMarker = getCurrentMarker();
    map.setView(prevMarker.getLatLng(), map.getZoom());
    prevMarker.openPopup();
  };
}

init();
