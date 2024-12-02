const express = require("express");
const {
  createService,
  updateService,
  getAllServices,
  getSingleService,
  deleteService,
} = require("../controllers/services");
const handleUploads = require("../middleware/upload");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

router.post("/add", protect, admin, handleUploads, createService);
router.put("/update/:id", protect, admin, handleUploads, updateService);
router.get("/all", getAllServices);
router.get("/:id", getSingleService);
router.delete("/:id", protect, admin, deleteService);

module.exports = router;
