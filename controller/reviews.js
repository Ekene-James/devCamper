const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

const asyncHandler = require("../middleware/asyncMiddleware");
const ErrorResponse = require("../utils/errorResponse");

//this controler will take care of two routes
// desc     get all reviews
//route     get /api/v1/reviews
// desc     get review for a single bootcamp
//route     get /api/v1/bootcamps/:bootcampId/reviews
//access    private
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const review = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: review.length,
      data: review
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// desc     get a single review
//route     get /api/v1/reviews/:id

//access    public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id : ${req.params.id} found `, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: review
  });
});

// desc    post a review
//route     post /api/v1/bootcamps/:bootcampId/reviews

//access    private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id : ${req.params.bootcampId} found `,
        404
      )
    );
  }
  const review = await Review.create(req.body);

  res.status(200).json({
    success: true,
    data: review
  });
});

// desc    update a review
//route     put /api/v1/reviews/:id

//access    private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id : ${req.params.id} found `, 404)
    );
  }
  //check if its the owner of the review or an admin before updating
  if (review.user.toString() !== req.user.id && review.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update this review`, 401));
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// desc    delete a review
//route     put /api/v1/reviews/:id

//access    private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id : ${req.params.id} found `, 404)
    );
  }
  //check if its the owner of the review or an admin before updating
  if (review.user.toString() !== req.user.id && review.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update this review`, 401));
  }
  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
