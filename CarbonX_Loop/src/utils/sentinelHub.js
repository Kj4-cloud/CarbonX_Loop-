// utils/sentinelHub.js

const SH_TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
const SH_PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process";
const SH_STATS_URL = "https://sh.dataspace.copernicus.eu/api/v1/statistics";

export async function getSHToken(clientId, clientSecret) {
  const res = await fetch(SH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export async function fetchNDVIImage(token, bbox, dateFrom, dateTo) {
  // bbox = [minLon, minLat, maxLon, maxLat]
  const evalscript = `
    //VERSION=3
    function setup() {
      return { input: ["B04", "B08", "dataMask"], output: { bands: 4 } };
    }
    const ramp = [
      [-0.5, 0x0c0c0c], [0, 0xeaeaea], [0.2, 0x91bf51],
      [0.4, 0x4f892d], [0.6, 0x0f540a], [1, 0x004400],
    ];
    const visualizer = new ColorRampVisualizer(ramp);
    function evaluatePixel(s) {
      let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
      return visualizer.process(ndvi).concat(s.dataMask);
    }
  `;

  const body = {
    input: {
      bounds: {
        bbox,
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: { from: dateFrom, to: dateTo },
            maxCloudCoverage: 20,
          },
        },
      ],
    },
    output: {
      width: 512,
      height: 512,
      responses: [{ identifier: "default", format: { type: "image/png" } }],
    },
    evalscript,
  };

  const res = await fetch(SH_PROCESS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function fetchNDVIStats(token, geometry, dateFrom, dateTo) {
  const evalscript = `
    //VERSION=3
    function setup() {
      return { input: [{ bands: ["B04", "B08", "dataMask"] }],
               output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" },
                        { id: "dataMask", bands: 1 }] };
    }
    function evaluatePixel(s) {
      return { ndvi: [(s.B08 - s.B04) / (s.B08 + s.B04)], dataMask: [s.dataMask] };
    }
  `;

  const body = {
    input: {
      bounds: { geometry },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: { timeRange: { from: dateFrom, to: dateTo } },
        },
      ],
    },
    aggregation: {
      timeRange: { from: dateFrom, to: dateTo },
      aggregationInterval: { of: "P30D" },
      evalscript,
      resx: 10,
      resy: 10,
    },
    calculations: {
      ndvi: {
        histograms: {},
        statistics: { default: { percentiles: { k: [25, 50, 75] } } },
      },
    },
  };

  const res = await fetch(SH_STATS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json(); // contains mean, min, max NDVI per month
}

/**
 * Estimate carbon sequestration from NDVI score and area.
 * Higher NDVI = denser vegetation = more carbon absorbed.
 *   NDVI 0.2–0.4  → sparse vegetation   → ~0.5 tCO₂/acre/year
 *   NDVI 0.4–0.6  → moderate vegetation  → ~1.5 tCO₂/acre/year
 *   NDVI 0.6–0.8  → dense vegetation     → ~3.0 tCO₂/acre/year
 *   NDVI >0.8     → very dense           → ~4.5 tCO₂/acre/year
 */
export function estimateCarbonFromNDVI(meanNDVI, areaAcres) {
  let ratePerAcre;
  if (meanNDVI >= 0.8) ratePerAcre = 4.5;
  else if (meanNDVI >= 0.6) ratePerAcre = 3.0;
  else if (meanNDVI >= 0.4) ratePerAcre = 1.5;
  else if (meanNDVI >= 0.2) ratePerAcre = 0.5;
  else ratePerAcre = 0.1;

  return {
    ratePerAcre,
    totalCredits: (ratePerAcre * areaAcres).toFixed(1),
    greennessPercent: Math.min(100, Math.round(meanNDVI * 125)), // 0.8 NDVI ≈ 100%
    healthLabel:
      meanNDVI >= 0.6
        ? "Excellent"
        : meanNDVI >= 0.4
          ? "Good"
          : meanNDVI >= 0.2
            ? "Fair"
            : "Poor",
  };
}
