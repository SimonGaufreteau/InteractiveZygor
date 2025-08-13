import L from "leaflet";
import "leaflet-polylinedecorator";
import "./style.css";

const imageWidth = 13000;
const imageHeight = 12000;

const bounds: L.LatLngBoundsExpression = [
  [0, 0],
  [imageHeight, imageWidth],
];

// Create map with flat coordinate system
const map = L.map("map", {
  crs: L.CRS.Simple,
  // TODO :This currently nicely fits to maxscreen, but would be nice if this was done automatically
  minZoom: -3.65,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
});

// Load image from public folder
L.imageOverlay("/map.png", bounds).addTo(map);
map.fitBounds(bounds);

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

// Array to store markers
const markers: L.Marker[] = [];

// Add marker on map click
map.on("click", (e: L.LeafletMouseEvent) => {
  const { lat, lng } = e.latlng;

  const marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`Marker at ${lat.toFixed(0)}, ${lng.toFixed(0)}`);

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
