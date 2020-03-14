const express = require("express");
const router = express.Router();
const {
  getBootcamp,
  getBootcamps,
  updateBootcamp,
  postBootcamp,
  deleteBootcamp,
  getFileupload
} = require("../controller/bootcamps");
const advancedResults = require("../middleware/advancedResultMiddleware");
const Bootcamps = require("../models/Bootcamp");
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const { protect, authorize } = require("../middleware/authMiddleware");

//redirect "/:bootcampId/courses"
router.use("/:bootcampId/courses", courseRouter);
//redirect "/:bootcampId/reviews"
router.use("/:bootcampId/reviews", reviewRouter);

//mount the controllers
router
  .route("/")
  .get(advancedResults(Bootcamps, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), postBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), getFileupload);
module.exports = router;
