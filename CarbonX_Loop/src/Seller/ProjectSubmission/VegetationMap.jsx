import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import {
  getSHToken,
  fetchNDVIImage,
  fetchNDVIStats,
  estimateCarbonFromNDVI,
} from "../../utils/sentinelHub";

/* ── Fly map to GPS when location changes ── */
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 16, { duration: 1.2 });
  }, [center, map]);
  return null;
}

/* ── Geoman draw controls ── */
function DrawControls({ onBoundaryDrawn }) {
  const map = useMap();

  useEffect(() => {
    // Add Geoman draw controls
    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      removalMode: true,
    });

    // Style the drawn shapes
    map.pm.setGlobalOptions({
      pathOptions: {
        color: "#13ec6d",
        fillColor: "#13ec6d",
        fillOpacity: 0.15,
        weight: 2,
      },
    });

    const handleCreate = (e) => {
      // Remove previously drawn shapes (only keep last one)
      map.eachLayer((layer) => {
        if (layer instanceof L.Polygon && layer !== e.layer && layer.pm) {
          map.removeLayer(layer);
        }
      });

      const latlngs = e.layer.getLatLngs()[0];
      const coords = latlngs.map((ll) => [ll.lng, ll.lat]);
      coords.push(coords[0]); // close the polygon
      const geometry = { type: "Polygon", coordinates: [coords] };
      const bounds = e.layer.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      onBoundaryDrawn({ geometry, bbox, bounds });
    };

    const handleEdit = (e) => {
      const layer = e.layer;
      const latlngs = layer.getLatLngs()[0];
      const coords = latlngs.map((ll) => [ll.lng, ll.lat]);
      coords.push(coords[0]);
      const geometry = { type: "Polygon", coordinates: [coords] };
      const bounds = layer.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      onBoundaryDrawn({ geometry, bbox, bounds });
    };

    const handleRemove = () => {
      onBoundaryDrawn(null);
    };

    map.on("pm:create", handleCreate);
    map.on("pm:edit", handleEdit);
    map.on("pm:remove", handleRemove);

    return () => {
      map.off("pm:create", handleCreate);
      map.off("pm:edit", handleEdit);
      map.off("pm:remove", handleRemove);
      map.pm.removeControls();
    };
  }, [map, onBoundaryDrawn]);

  return null;
}

/* ── Main VegetationMap Component ── */
export default function VegetationMap({ gpsLocation, landSize, onResult }) {
  const [boundary, setBoundary] = useState(null);
  const [ndviImageUrl, setNdviImageUrl] = useState(null);
  const [ndviOverlayBounds, setNdviOverlayBounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const defaultCenter = gpsLocation
    ? [gpsLocation.lat, gpsLocation.lng]
    : [20.5937, 78.9629]; // India center fallback

  const handleBoundaryDrawn = useCallback((data) => {
    setBoundary(data);
    // Clear previous results when boundary changes
    setNdviImageUrl(null);
    setNdviOverlayBounds(null);
    setStats(null);
    setError(null);
  }, []);

  const handleAnalyze = async () => {
    if (!boundary) return;
    setLoading(true);
    setError(null);
    setNdviImageUrl(null);
    setStats(null);

    try {
      const token = await getSHToken(
        import.meta.env.VITE_SH_CLIENT_ID,
        import.meta.env.VITE_SH_CLIENT_SECRET,
      );

      const now = new Date();
      const dateTo = now.toISOString();
      const dateFrom = new Date(
        now.getTime() - 90 * 24 * 60 * 60 * 1000,
      ).toISOString();

      // Fetch NDVI image using the drawn boundary's bbox
      const imgUrl = await fetchNDVIImage(
        token,
        boundary.bbox,
        dateFrom,
        dateTo,
      );
      setNdviImageUrl(imgUrl);
      setNdviOverlayBounds([
        [boundary.bbox[1], boundary.bbox[0]], // SW
        [boundary.bbox[3], boundary.bbox[2]], // NE
      ]);

      // Fetch NDVI statistics
      let meanNDVI = 0.45;
      try {
        const statsData = await fetchNDVIStats(
          token,
          boundary.geometry,
          dateFrom,
          dateTo,
        );
        if (statsData?.data?.length > 0) {
          const lastInterval = statsData.data[statsData.data.length - 1];
          const ndviOutput = lastInterval?.outputs?.ndvi?.bands?.B0?.stats;
          if (ndviOutput?.mean !== undefined) {
            meanNDVI = ndviOutput.mean;
          }
        }
      } catch (statsErr) {
        console.warn("NDVI stats failed, using fallback:", statsErr);
      }

      const acres = parseFloat(landSize) || 1;
      const result = estimateCarbonFromNDVI(meanNDVI, acres);
      const fullResult = { meanNDVI: meanNDVI.toFixed(2), ...result };
      setStats(fullResult);
      if (onResult) onResult(fullResult);
    } catch (err) {
      console.error("Sentinel Hub error:", err);
      setError("Failed to fetch satellite data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (label) => {
    switch (label) {
      case "Excellent":
        return "#13ec6d";
      case "Good":
        return "#84cc16";
      case "Fair":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

  if (!gpsLocation) {
    return (
      <div className="ps-vegetation-section">
        <label className="ps-form-label">
          <span className="material-symbols-outlined ps-form-label-icon">
            satellite_alt
          </span>
          Vegetation Analysis
          <span
            style={{
              fontWeight: 400,
              color: "var(--slate-400)",
              fontSize: "0.625rem",
              textTransform: "none",
              letterSpacing: 0,
              marginLeft: "0.5rem",
            }}
          >
            Sentinel Hub
          </span>
        </label>
        <div
          className="ps-veg-scan-btn"
          style={{ cursor: "default", opacity: 0.5 }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.25rem", color: "var(--slate-400)" }}
          >
            location_off
          </span>
          <div>
            <p className="ps-veg-scan-label">GPS Location Required</p>
            <p className="ps-veg-scan-hint">
              Capture a photo with GPS to enable satellite analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-vegetation-section">
      <label className="ps-form-label">
        <span className="material-symbols-outlined ps-form-label-icon">
          satellite_alt
        </span>
        Vegetation Analysis
        <span
          style={{
            fontWeight: 400,
            color: "var(--slate-400)",
            fontSize: "0.625rem",
            textTransform: "none",
            letterSpacing: 0,
            marginLeft: "0.5rem",
          }}
        >
          Sentinel Hub
        </span>
      </label>

      {/* Interactive Map */}
      <div className="ps-veg-map-container">
        <MapContainer
          center={defaultCenter}
          zoom={16}
          className="ps-veg-leaflet-map"
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            maxZoom={20}
          />

          <MapUpdater
            center={gpsLocation ? [gpsLocation.lat, gpsLocation.lng] : null}
          />
          <DrawControls onBoundaryDrawn={handleBoundaryDrawn} />
          <FeatureGroup />

          {/* NDVI overlay on map */}
          {ndviImageUrl && ndviOverlayBounds && (
            <ImageOverlay
              url={ndviImageUrl}
              bounds={ndviOverlayBounds}
              opacity={0.7}
            />
          )}
        </MapContainer>

        {/* Map instructions overlay */}
        {!boundary && (
          <div className="ps-veg-map-hint">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1rem" }}
            >
              draw
            </span>
            Draw a boundary around your land using the tools on the left
          </div>
        )}
      </div>

      {/* Analyze button */}
      {boundary && !stats && !loading && (
        <button
          type="button"
          className="ps-veg-analyze-btn"
          onClick={handleAnalyze}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.125rem" }}
          >
            satellite_alt
          </span>
          Analyze Vegetation in Selected Area
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="ps-veg-loading">
          <span
            className="material-symbols-outlined animate-spin"
            style={{ fontSize: "1.5rem", color: "var(--primary)" }}
          >
            progress_activity
          </span>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.8125rem" }}>
              Analyzing Satellite Imagery...
            </p>
            <p style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>
              Fetching NDVI data from Sentinel-2 for your selected area
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="ps-veg-error">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.25rem", color: "#ef4444" }}
          >
            error
          </span>
          <p>{error}</p>
          <button
            type="button"
            className="ps-veg-retry-btn"
            onClick={handleAnalyze}
          >
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {stats && (
        <div className="ps-veg-result">
          <div className="ps-veg-stats-grid">
            <div className="ps-veg-stat">
              <span className="ps-veg-stat-label">Health Score</span>
              <span
                className="ps-veg-stat-value"
                style={{ color: getHealthColor(stats.healthLabel) }}
              >
                {stats.healthLabel}
              </span>
            </div>
            <div className="ps-veg-stat">
              <span className="ps-veg-stat-label">NDVI Index</span>
              <span className="ps-veg-stat-value">{stats.meanNDVI}</span>
            </div>
            <div className="ps-veg-stat">
              <span className="ps-veg-stat-label">Greenness</span>
              <span
                className="ps-veg-stat-value"
                style={{ color: "var(--primary)" }}
              >
                {stats.greennessPercent}%
              </span>
            </div>
            <div className="ps-veg-stat">
              <span className="ps-veg-stat-label">Carbon Potential</span>
              <span
                className="ps-veg-stat-value"
                style={{ color: "var(--primary)" }}
              >
                {stats.totalCredits} tCO₂e
              </span>
            </div>
          </div>

          <div className="ps-veg-bar-wrap">
            <div className="ps-veg-bar-label">
              <span>Vegetation Coverage</span>
              <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                {stats.greennessPercent}%
              </span>
            </div>
            <div className="ps-veg-bar-track">
              <div
                className="ps-veg-bar-fill"
                style={{ width: `${stats.greennessPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            className="ps-veg-rescan-btn"
            onClick={handleAnalyze}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "0.875rem" }}
            >
              refresh
            </span>
            Re-analyze
          </button>
        </div>
      )}
    </div>
  );
}
