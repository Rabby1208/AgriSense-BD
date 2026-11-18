import {
  getAllCrops,
  getCropById,
  getAllLocations,
  getAllSeasons
} from "../services/data.service.js";

export const getCrops = async (req, res) => {
  const crops = await getAllCrops();

  res.status(200).json({
    success: true,
    count: crops.length,
    data: crops
  });
};

export const getCropDetails = async (req, res) => {
  const crop = await getCropById(req.params.cropId);

  if (!crop) {
    return res.status(404).json({
      success: false,
      message: "Crop not found"
    });
  }

  res.status(200).json({
    success: true,
    data: crop
  });
};

export const getLocations = async (req, res) => {
  const locations = await getAllLocations();

  res.status(200).json({
    success: true,
    data: locations
  });
};

export const getSeasons = async (req, res) => {
  const seasons = await getAllSeasons();

  res.status(200).json({
    success: true,
    data: seasons
  });
};