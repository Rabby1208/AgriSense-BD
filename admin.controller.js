
import pool from "../config/db.js";

import {
  createExpertAccount,
  updateUserStatus,
  createCrop,
  updateCrop,
  deactivateCrop,
  getAllCrops,
  getAllCropGrowthStages,
  createCropGrowthStage,
  updateCropGrowthStage,
  updateCropGrowthStageStatus,
  createFertilizer,
  updateFertilizer,
  deactivateFertilizer,
  getAllFertilizers,
  createMarketPrice,
  updateMarketPrice,
  updateMarketPriceStatus,
  getAllMarketPrices,
  getAllBulletins,
  createBulletin,
  updateBulletin,
  updateBulletinStatus,
} from "../services/admin.service.js";


// GET ADMIN DASHBOARD STATISTICS
export async function getAdminDashboard(req, res) {
  try {
    const [userStats] = await pool.execute(
      `SELECT
         COUNT(*) AS total_users,
         SUM(role = 'farmer') AS total_farmers,
         SUM(role = 'admin') AS total_admins,
         SUM(role = 'agri_expert') AS total_experts,
         SUM(is_active = 1) AS active_users,
         SUM(is_active = 0) AS inactive_users
       FROM users`
    );

    const [profileStats] = await pool.execute(
      `SELECT COUNT(*) AS total_farmer_profiles
       FROM farmer_profiles`
    );

    const [expertStats] = await pool.execute(
      `SELECT COUNT(*) AS total_expert_profiles
       FROM expert_profiles`
    );

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully.",
      data: {
        users: userStats[0],
        farmer_profiles: profileStats[0].total_farmer_profiles,
        expert_profiles: expertStats[0].total_expert_profiles,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve admin dashboard data.",
    });
  }
}


// GET ALL USERS
export async function getAllUsers(req, res) {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const offset = (page - 1) * limit;

    const [users] = await pool.execute(
      `SELECT
         id,
         full_name,
         phone,
         role,
         is_active,
         created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM users`
    );

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: countRows[0].total,
          totalPages: Math.ceil(countRows[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
}


// CREATE EXPERT
export async function createExpert(req, res) {
  try {
    const expert = await createExpertAccount(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Agri Expert account created successfully.",
      data: {
        expert,
      },
    });
  } catch (error) {
    console.error("Create Expert Error:", error);

    const statusCode =
      error.message.includes("already registered") ? 409 :
      error.message.includes("Invalid") ||
      error.message.includes("must be") ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to create Agri Expert account."
        : error.message,
    });
  }
}


// CHANGE USER STATUS
export async function changeUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const updatedUser = await updateUserStatus(
      req.user.id,
      userId,
      isActive
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User account activated successfully."
        : "User account deactivated successfully.",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Change User Status Error:", error);

    const clientErrors = [
      "Invalid user ID.",
      "isActive must be true or false.",
      "You cannot change your own account status.",
      "The last active admin cannot be deactivated.",
      "User not found.",
    ];

    const statusCode = clientErrors.includes(error.message)
      ? error.message === "User not found." ? 404 : 400
      : 500;

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to update user status."
        : error.message,
    });
  }
}


// CROP ERROR STATUS
function getCropErrorStatus(error) {
  const badRequestErrors = [
    "Crop ID must be 1-80 characters.",
    "Invalid crop ID.",
    "Invalid Bangla crop name.",
    "Invalid English crop name.",
    "Crop data must be a valid JSON object.",
  ];

  if (badRequestErrors.includes(error.message)) return 400;
  if (error.message === "Crop ID already exists.") return 409;
  if (error.message === "Crop not found.") return 404;

  return 500;
}


// CREATE CROP
export async function addCrop(req, res) {
  try {
    const crop = await createCrop(req.body);

    return res.status(201).json({
      success: true,
      message: "Crop created successfully.",
      data: { crop },
    });
  } catch (error) {
    console.error("Create Crop Error:", error);

    const statusCode = getCropErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to create crop."
        : error.message,
    });
  }
}


// UPDATE CROP
export async function editCrop(req, res) {
  try {
    const crop = await updateCrop(
      req.params.cropId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Crop updated successfully.",
      data: { crop },
    });
  } catch (error) {
    console.error("Update Crop Error:", error);

    const statusCode = getCropErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to update crop."
        : error.message,
    });
  }
}


// DEACTIVATE CROP
export async function removeCrop(req, res) {
  try {
    const crop = await deactivateCrop(req.params.cropId);

    return res.status(200).json({
      success: true,
      message: "Crop deactivated successfully.",
      data: { crop },
    });
  } catch (error) {
    console.error("Deactivate Crop Error:", error);

    const statusCode = getCropErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to deactivate crop."
        : error.message,
    });
  }
}


// GET ALL CROPS
export async function listCrops(req, res) {
  try {
    const crops = await getAllCrops();

    return res.status(200).json({
      success: true,
      message: "Crops retrieved successfully.",
      data: {
        total: crops.length,
        crops,
      },
    });
  } catch (error) {
    console.error("Get Crops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve crops.",
    });
  }
}


// GROWTH STAGE ERROR STATUS
function getGrowthStageErrorStatus(error) {
  const badRequestErrors = [
    "Invalid stage ID.",
    "Invalid crop ID.",
    "Invalid stage key.",
    "Invalid Bangla stage name.",
    "Invalid English stage name.",
    "Invalid stage day.",
    "End day cannot be before start day.",
    "Activities and possible risks must be arrays.",
    "Invalid verification status.",
    "isActive must be true or false.",
    "Verified growth stage requires a source URL or source document.",
  ];

  if (badRequestErrors.includes(error.message)) return 400;
  if (error.message === "Crop not found.") return 404;
  if (error.message === "Stage key already exists for this crop.") return 409;
  if (error.message === "Growth stage not found.") return 404;

  return 500;
}


// GET ALL GROWTH STAGES
export async function listCropGrowthStages(req, res) {
  try {
    const stages = await getAllCropGrowthStages();

    return res.status(200).json({
      success: true,
      data: {
        total: stages.length,
        stages,
      },
    });
  } catch (error) {
    console.error("Get Growth Stages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve growth stages.",
    });
  }
}


// CREATE GROWTH STAGE
export async function addCropGrowthStage(req, res) {
  try {
    const stage = await createCropGrowthStage(req.body);

    return res.status(201).json({
      success: true,
      message: "Growth stage created successfully.",
      data: { stage },
    });
  } catch (error) {
    console.error("Create Growth Stage Error:", error);

    const statusCode = getGrowthStageErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to create growth stage."
        : error.message,
    });
  }
}


// UPDATE GROWTH STAGE
export async function editCropGrowthStage(req, res) {
  try {
    const stage = await updateCropGrowthStage(
      req.params.stageId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Growth stage updated successfully.",
      data: { stage },
    });
  } catch (error) {
    console.error("Update Growth Stage Error:", error);

    const statusCode = getGrowthStageErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to update growth stage."
        : error.message,
    });
  }
}


// ACTIVATE / DEACTIVATE GROWTH STAGE
export async function changeCropGrowthStageStatus(req, res) {
  try {
    const stage = await updateCropGrowthStageStatus(
      req.params.stageId,
      req.body.isActive
    );

    return res.status(200).json({
      success: true,
      message: stage.is_active
        ? "Growth stage activated successfully."
        : "Growth stage deactivated successfully.",
      data: { stage },
    });
  } catch (error) {
    console.error("Growth Stage Status Error:", error);

    const statusCode = getGrowthStageErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to update growth stage status."
        : error.message,
    });
  }
}


// FERTILIZER ERROR STATUS
function getFertilizerErrorStatus(error) {
  const badRequestErrors = [
    "Invalid fertilizer ID.",
    "Crop selection is required.",
    "Selected crop not found or inactive.",
    "Bangla fertilizer name is required.",
    "English fertilizer name is required.",
    "Invalid verification status.",
    "Verified fertilizer requires a source URL or source document.",
  ];

  if (badRequestErrors.includes(error.message)) return 400;
  if (error.message === "Fertilizer ID already exists.") return 409;
  if (error.message === "Fertilizer not found.") return 404;

  return 500;
}


// GET ALL FERTILIZERS
export async function listFertilizers(req, res) {
  try {
    const fertilizers = await getAllFertilizers();

    return res.status(200).json({
      success: true,
      data: {
        total: fertilizers.length,
        fertilizers,
      },
    });
  } catch (error) {
    console.error("Get Fertilizers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve fertilizers.",
    });
  }
}


// CREATE FERTILIZER
export async function addFertilizer(req, res) {
  try {
    const fertilizer = await createFertilizer(req.body);

    return res.status(201).json({
      success: true,
      message: "Fertilizer created successfully.",
      data: { fertilizer },
    });
  } catch (error) {
    console.error("Create Fertilizer Error:", error);

    const statusCode = getFertilizerErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to create fertilizer."
        : error.message,
    });
  }
}


// UPDATE FERTILIZER
export async function editFertilizer(req, res) {
  try {
    const fertilizer = await updateFertilizer(
      req.params.fertilizerId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Fertilizer updated successfully.",
      data: { fertilizer },
    });
  } catch (error) {
    console.error("Update Fertilizer Error:", error);

    const statusCode = getFertilizerErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to update fertilizer."
        : error.message,
    });
  }
}


// DEACTIVATE FERTILIZER
export async function removeFertilizer(req, res) {
  try {
    const fertilizer = await deactivateFertilizer(
      req.params.fertilizerId
    );

    return res.status(200).json({
      success: true,
      message: "Fertilizer deactivated successfully.",
      data: { fertilizer },
    });
  } catch (error) {
    console.error("Deactivate Fertilizer Error:", error);

    const statusCode = getFertilizerErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to deactivate fertilizer."
        : error.message,
    });
  }
}


// MARKET PRICE ERROR STATUS
function getMarketPriceErrorStatus(error) {
  const badRequestErrors = [
    "Invalid market price ID.",
    "Valid crop ID is required.",
    "Valid observed date is required.",
    "Invalid market price value.",
    "Minimum price cannot exceed maximum price.",
    "Invalid market price status.",
  ];

  if (badRequestErrors.includes(error.message)) return 400;
  if (error.message === "Crop not found.") return 404;
  if (error.message === "Market price not found.") return 404;

  return 500;
}


// GET ALL MARKET PRICES
export async function listMarketPrices(req, res) {
  try {
    const prices = await getAllMarketPrices();

    return res.status(200).json({
      success: true,
      data: {
        total: prices.length,
        prices,
      },
    });
  } catch (error) {
    console.error("Get Market Prices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve market prices.",
    });
  }
}


// CREATE MARKET PRICE
export async function addMarketPrice(req, res) {
  try {
    const price = await createMarketPrice(req.body);

    return res.status(201).json({
      success: true,
      message: "Market price created successfully.",
      data: { price },
    });
  } catch (error) {
    console.error("Create Market Price Error:", error);

    const statusCode = getMarketPriceErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to create market price."
        : error.message,
    });
  }
}


// UPDATE MARKET PRICE
export async function editMarketPrice(req, res) {
  try {
    const price = await updateMarketPrice(
      req.params.priceId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Market price updated successfully.",
      data: { price },
    });
  } catch (error) {
    console.error("Update Market Price Error:", error);

    const statusCode = getMarketPriceErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to update market price."
        : error.message,
    });
  }
}


// APPROVE / REJECT MARKET PRICE
export async function changeMarketPriceStatus(req, res) {
  try {
    const price = await updateMarketPriceStatus(
      req.params.priceId,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: `Market price status changed to ${price.status}.`,
      data: { price },
    });
  } catch (error) {
    console.error("Market Price Status Error:", error);

    const statusCode = getMarketPriceErrorStatus(error);

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500
        ? "Failed to update market price status."
        : error.message,
    });
  }
}


// BULLETIN MANAGEMENT


// GET ALL BULLETINS
export async function listBulletins(req, res) {
  try {
    const bulletins = await getAllBulletins();

    return res.status(200).json({
      success: true,
      data: {
        total: bulletins.length,
        bulletins,
      },
    });
  } catch (error) {
    console.error("List Bulletins Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bulletins.",
    });
  }
}


// CREATE BULLETIN
export async function addBulletin(req, res) {
  try {
    const result = await createBulletin({
      ...req.body,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Add Bulletin Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


// UPDATE BULLETIN
export async function editBulletin(req, res) {
  try {
    const result = await updateBulletin(
      req.params.bulletinId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Edit Bulletin Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


// CHANGE BULLETIN STATUS
export async function changeBulletinStatus(req, res) {
  try {
    const { status } = req.body;

    const result = await updateBulletinStatus(
      req.params.bulletinId,
      status
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Change Bulletin Status Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
