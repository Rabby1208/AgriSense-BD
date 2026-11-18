import express from "express";

import {
  getCrops,
  getCropDetails,
  getLocations,
  getSeasons
} from "../controllers/data.controller.js";

const router = express.Router();

router.get("/crops", getCrops);
router.get("/crops/:cropId", getCropDetails);
router.get("/locations", getLocations);
router.get("/seasons", getSeasons);

export default router;