import L from "leaflet";
import "leaflet-polylinedecorator";

import type { Point } from "../scripts/types";

const imageWidth = 13000;
const imageHeight = 12000;

export function imageCoordsToLeaflet(x: number, y: number): L.LatLngExpression {
  return [imageHeight - y, x];
}

export function leafletToImageCoords(lat: number, lng: number): Point {
  return {
    x: lng,
    y: imageHeight - lat,
  };
}

export function loadMap(): L.Map {
  const bounds: L.LatLngBoundsExpression = [
    [imageHeight, 0], // top-left in Leaflet coordinates
    [0, imageWidth], // bottom-right
  ];

  const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -2.7,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
  });

  L.imageOverlay("/map.png", bounds).addTo(map);
  map.fitBounds(bounds);

  return map;
}

export function setTriggers(map: L.Map) {
  // Array to store markers
  const markers: L.Marker[] = [];

  // Add marker on map click
  map.on("click", (e: L.LeafletMouseEvent) => {
    const { x, y } = leafletToImageCoords(e.latlng.lat, e.latlng.lng);
    const marker = L.marker([e.latlng.lat, e.latlng.lng])
      .addTo(map)
      .bindPopup(
        `Marker at ${x.toFixed(0)}, ${y.toFixed(0)} (leaflet : ${e.latlng.lat.toFixed(0)}, ${e.latlng.lng.toFixed(0)})`,
      );

    // Click marker to remove it
    marker.on("dblclick", () => {
      marker.remove();
      const index = markers.indexOf(marker);
      if (index > -1) markers.splice(index, 1);
    });

    marker.on("click", () => {
      marker.openPopup();
    });

    markers.push(marker);
  });
}

export function drawLine(
  start: Point,
  end: Point,
  map: L.Map,
): [L.Polyline, L.polylineDecorator] {
  const coordsA = leafletToImageCoords(start.y, start.x);
  const coordsB = leafletToImageCoords(end.y, end.x);
  const pointA: L.LatLngExpression = [coordsA.y, coordsA.x];
  const pointB: L.LatLngExpression = [coordsB.y, coordsB.x];

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
  return [line, arrow];
}

const markerHtmlFromColor = (color: string) => `
  background-color: ${color};
  width: 1rem;
  height: 1rem;
  display: block;
  left: -0.3rem;
  top: -0.3rem;
  position: relative;
  border-radius: 1rem 1rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF`;

export const markerIconFromColor = (color: string) =>
  L.divIcon({
    className: "my-custom-pin",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlFromColor(color)}" />`,
  });
