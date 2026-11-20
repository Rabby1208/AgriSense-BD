
import { createAdvisoryRequest } from "../services/advisory.service.js";

const soilTypes = [
  "clay",
  "loamy",
  "sandy",
  "silty",
  "unknown"
];

const irrigationTypes = [
  "available",
  "unavailable",
  "limited",
  "unknown"
];

const validCrops = [
  "boro_rice",
  "potato",
  "tomato",
  "mustard"
];

// Validate actual YYYY-MM-DD date
function isValidDate(dateString) {
  if (typeof dateString !== "string") return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
}

export async function submitAdvisoryRequest(req, res) {
  try {
    const {
      district,
      upazila,
      landDecimal,
      soilType,
      irrigation,
      crop,
      plantingDate
    } = req.body || {};

    // Validate required information
    if (
      !district ||
      !upazila ||
      !Number.isFinite(Number(landDecimal)) ||
      Number(landDecimal) <= 0 ||
      !soilTypes.includes(soilType) ||
      !irrigationTypes.includes(irrigation)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid advisory form information."
      });
    }

    // Validate crop selection
    if (crop && !validCrops.includes(crop)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop selection."
      });
    }

    // Validate planting date
    if (plantingDate && !isValidDate(plantingDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planting date."
      });
    }

    // Generate advisory immediately
    const result = await createAdvisoryRequest({
      district,
      upazila,
      landDecimal,
      soilType,
      irrigation,
      crop,
      plantingDate
    });

    return res.status(201).json({
      success: true,
      message: "Your crop advisory has been generated successfully.",
      data: {
        id: result.id,
        status: result.status,
        advisory: result.advisory
      }
    });

  } catch (error) {
    console.error("Submit Advisory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate crop advisory. Please try again."
    });
  }
}
