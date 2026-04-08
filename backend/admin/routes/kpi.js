const express = require('express');
const router = express.Router();
const {
  getKPI,
  getSongMetricsSummary,
  insertOrUpdateKpiScore,
  insertKpiRunMetadata,
  fetchAllKpiScores,
  getCollabArtistKpiDetailController,
  getArtistSearchFiltersController,
  getTopSearchedArtistsController,
  getTopArtistsController,
  getArtistProfile,
  fetchmonthly,
  getSpecialArtistMonthlyMetrics,
} = require("../controllers/kpi");

/** Independent artists use OPH IDs like OPH-CAN-IA-01 (segment `-IA-`). */
const isIndependentArtistOphId = (ophId) => {
  if (ophId == null || ophId === "") return false;
  return String(ophId).toUpperCase().includes("-IA-");
};

/** Special artists use OPH IDs like OPH-CAN-SA-99 (segment `-SA-`). */
const isSpecialArtistOphId = (ophId) => {
  if (ophId == null || ophId === "") return false;
  return String(ophId).toUpperCase().includes("-SA-");
};

const wrapFilterPlainArrayJson = (handler) => async (req, res, next) => {
  const origJson = res.json.bind(res);
  res.json = (body) => {
    if (Array.isArray(body)) {
      return origJson(
        body.filter((row) =>
          isIndependentArtistOphId(row.OPH_ID ?? row.oph_id),
        ),
      );
    }
    return origJson(body);
  };
  await handler(req, res, next);
};

const wrapFilterJsonBody = (handler, mapBody) => async (req, res, next) => {
  const origJson = res.json.bind(res);
  res.json = (body) => origJson(mapBody(body, req));
  await handler(req, res, next);
};

const iaOnlyTopArtistsBody = (body) => {
  if (!body || typeof body !== "object" || !Array.isArray(body.data)) {
    return body;
  }
  return {
    ...body,
    data: body.data.filter((row) => isIndependentArtistOphId(row.oph_id)),
  };
};

const iaOnlyKpiScoresBody = (body) => {
  if (
    !body ||
    typeof body !== "object" ||
    body.data == null ||
    typeof body.data !== "object" ||
    Array.isArray(body.data)
  ) {
    return body;
  }
  const filtered = {};
  for (const [key, val] of Object.entries(body.data)) {
    if (isIndependentArtistOphId(key)) filtered[key] = val;
  }
  return { ...body, data: filtered };
};

const iaOnlyMonthlyKpiBody = (body) => {
  if (!body || typeof body !== "object" || !Array.isArray(body.data)) {
    return body;
  }
  return {
    ...body,
    data: body.data.filter((row) =>
      isIndependentArtistOphId(row.oph_id ?? row.OPH_ID),
    ),
  };
};

const iaOnlyGetKpiS3Body = (body, req) => {
  const oph = req.query?.OPH_ID;
  if (
    oph != null &&
    String(oph).trim() !== "" &&
    !isIndependentArtistOphId(oph) &&
    !isSpecialArtistOphId(oph)
  ) {
    return { success: true, s3Metrics: [] };
  }
  return body;
};

const collabKpiIndependentOnly = async (req, res, next) => {
  const ophId = String(req.params?.ophId ?? "").trim();
  if (!isIndependentArtistOphId(ophId)) {
    return res.status(404).json({
      success: false,
      message: "Artist not found",
    });
  }
  return getCollabArtistKpiDetailController(req, res, next);
};

router.get(
  "/get_kpi_model",
  wrapFilterPlainArrayJson(getSongMetricsSummary),
);
router.post("/insert_kpi_score", insertOrUpdateKpiScore);
router.post("/insert_kpi_run_metadata", insertKpiRunMetadata);
router.get("/artist-search-filters", getArtistSearchFiltersController);
router.get("/get-top-searched-artist", getTopSearchedArtistsController);
router.get(
  "/get-top-artist",
  wrapFilterJsonBody(getTopArtistsController, iaOnlyTopArtistsBody),
);
router.get("/get-top-artist-detail", getArtistProfile);

// GET /api/kpi-score — Get all scores sorted by highest

router.get(
  "/kpi_score",
  wrapFilterJsonBody(fetchAllKpiScores, iaOnlyKpiScoresBody),
);
router.get("/collab_artist_kpi/:ophId", collabKpiIndependentOnly);
router.get(
  "/kpi_monthly_score",
  wrapFilterJsonBody(fetchmonthly, iaOnlyMonthlyKpiBody),
);
router.get("/getKPI", wrapFilterJsonBody(getKPI, iaOnlyGetKpiS3Body));

router.get(
  "/special_artist_monthly_metrics",
  getSpecialArtistMonthlyMetrics,
);

module.exports = router;
