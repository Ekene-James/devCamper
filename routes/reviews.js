const express = require("express");
const router = express.Router({ mergeParams: true });
const advancedResults = require("../middleware/advancedResultMiddleware");
const Review = require("../models/Review");

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
} = require("../controller/reviews");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(
    advancedResults(Review, { path: "bootcamp", select: "name description" }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), createReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);
module.exports = router;
