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
    minZoom: -3.65,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
  });

  L.imageOverlay("/map.png", bounds).addTo(map);
  map.fitBounds(bounds);

  return map;
}

export function setTriggers(map) {
  // Array to store markers
  const markers: L.Marker[] = [];

  // Add marker on map click
  map.on("click", (e: L.LeafletMouseEvent) => {
    const { x, y } = leafletToImageCoords(e.latlng.lat, e.latlng.lng);
    const marker = L.marker([e.latlng.lat, e.latlng.lng])
      .addTo(map)
      .bindPopup(`Marker at ${x.toFixed(0)}, ${y.toFixed(0)}`);

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
