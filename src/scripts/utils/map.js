import {
  map,
  tileLayer,
  Icon,
  icon,
  marker,
  popup,
  latLng,
  layerGroup,
  control,
  featureGroup,
} from "leaflet";

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Perbaiki ikon default Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


export default class Map {
  #zoom = 15;
  #map = null;
  #baseLayers = {};
  #overlayLayers = {};
  #layerControl = null;

  static isGeolocationAvailable() {
    return "geolocation" in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject("Geolocation API unsupported");
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async build(selector, options = {}) {
    const jakartaCoordinate = [-6.2, 106.816666];

    if ("center" in options && options.center) {
      return new Map(selector, options);
    }

    if ("locate" in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        return new Map(selector, { ...options, center: coordinate });
      } catch (error) {
        console.error("build: error:", error);
      }
    }

    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    const container = document.querySelector(selector);
    if (!container) {
      throw new Error(`Element '${selector}' tidak ditemukan di DOM.`);
    }

    // Fix untuk error: "Map container is already initialized"
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const osm = tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    const osmHOT = tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      }
    );

    const openTopoMap = tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 17,
        attribution:
          'Map style by <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a>',
      }
    );

    const satellite = tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          'Imagery &copy; <a href="https://www.esri.com/" target="_blank">Esri</a>, Earthstar Geographics',
        maxZoom: 20,
      }
    );

    this.#baseLayers = {
      OpenStreetMap: osm,
      "OpenStreetMap.HOT": osmHOT,
      OpenTopoMap: openTopoMap,
      Satellite: satellite,
    };

    const cafes = layerGroup([
      marker([-6.8905, 107.6101]).bindPopup("Kafe Sejiwa"),
      marker([-6.9175, 107.6098]).bindPopup("Kafe Braga Art"),
      marker([-6.9137, 107.6138]).bindPopup("Kafe Bali"),
      marker([-6.9112, 107.6135]).bindPopup("Kafe Lacamera"),
    ]);

    const parks = layerGroup([
      marker([-6.9008, 107.6155]).bindPopup("Taman Lansia"),
      marker([-6.9191, 107.6098]).bindPopup("Taman Vanda"),
      marker([-6.9119, 107.6246]).bindPopup("Taman Super Hero"),
    ]);

    const kupangLandmarks = layerGroup([
      marker([-10.165, 123.607]).bindPopup("Pantai Lasiana"),
      marker([-10.1623, 123.5745]).bindPopup("Bundaran PU Kupang"),
      marker([-10.1531, 123.5842]).bindPopup("Pantai Ketapang Satu"),
      marker([-10.1497, 123.6169]).bindPopup("Universitas Nusa Cendana"),
    ]);

    this.#overlayLayers = {
      Cafes: cafes,
      Parks: parks,
      Kupang: kupangLandmarks,
    };

    this.#map = map(container, {
      zoom: this.#zoom,
      center: options.center ?? [-10.165, 123.607],
      scrollWheelZoom: false,
      layers: [satellite, kupangLandmarks],
    });

    this.#layerControl = control.layers(this.#baseLayers, this.#overlayLayers);
    this.#layerControl.addTo(this.#map);

    const kupangGroup = featureGroup(kupangLandmarks.getLayers());
    kupangGroup.on("click", () => {
      alert("Klik pada lokasi menarik di Kupang!");
    });
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
      return;
    }
    this.#map.setView(latLng(coordinate), zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error("coordinates must be an array of [latitude, longitude]");
    }

    if (typeof markerOptions !== "object" || markerOptions === null) {
      throw new Error("markerOptions must be a non-null object");
    }

    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    if (popupOptions !== null) {
      if (typeof popupOptions !== "object" || popupOptions === null) {
        throw new Error("popupOptions must be a non-null object");
      }

      if (!popupOptions.hasOwnProperty("content")) {
        throw new Error("popupOptions must include a `content` property");
      }

      const newPopup = popup(popupOptions).setLatLng(coordinates);
      newMarker.bindPopup(newPopup);
    }

    newMarker.addTo(this.#map);
    return newMarker;
  }

  static async getPlaceNameByCoordinate([lat, lng]) {
    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      const city = data.address?.city || "";
      const state = data.address?.state || "";
      const country = data.address?.country || "";
      const address = city
        ? `${city}, ${state || country}`
        : `${state || country}`;
      return address || "Lokasi tidak ditemukan";
    } catch (error) {
      console.error("getPlaceNameByCoordinate error:", error);
      return "Gagal mendapatkan lokasi";
    }
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }
}
