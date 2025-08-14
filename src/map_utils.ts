export function loadMap(): L.Map {
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
  return map;
}

export function setTriggers(map) {
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
}
