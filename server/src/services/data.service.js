import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

// Project root-এর data folder
const DATA_DIRECTORY = path.resolve(
  currentDirectory,
  "../../../data"
);

async function readJson(relativePath) {
  const fullPath = path.resolve(DATA_DIRECTORY, relativePath);

  // Data folder-এর বাইরে file access বন্ধ রাখা
  if (!fullPath.startsWith(DATA_DIRECTORY + path.sep)) {
    throw new Error("Invalid data file path");
  }

  const content = await fs.readFile(fullPath, "utf-8");

  return JSON.parse(content);
}

export async function getAllCrops() {
  const registry = await readJson("crop-registry.json");

  return registry.crops.filter((crop) => crop.active === true);
}

export async function getCropById(cropId) {
  const registry = await readJson("crop-registry.json");

  const cropInfo = registry.crops.find(
    (crop) => crop.id === cropId && crop.active === true
  );

  if (!cropInfo) {
    return null;
  }

  return readJson(cropInfo.file);
}

export async function getAllLocations() {
  return readJson("locations.json");
}

export async function getAllSeasons() {
  return readJson("seasons.json");
}