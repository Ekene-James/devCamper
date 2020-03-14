const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncMiddleware");
const ErrorResponse = require("../utils/errorResponse");

//this controler will take care of two routes
// desc     get all courses
//route     get /api/v1/courses
// desc     get course for a single bootcamp
//route     get /api/v1/bootcamps/:bootcampId/courses
//access    public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const course = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: course.length,
      data: course
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// desc     get a single courses
//route     get /api/v1/courses/:id
//access    public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id : ${req.params.id} found `, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// desc     create a course for a bootcamp
//route     post /api/v1/bootcamp/:bootcampId/courses
//access    private
exports.createCourse = asyncHandler(async (req, res, next) => {
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
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id : ${req.user.id} not authorized to add a course to bootcamp with id: ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

// desc     update a course for a bootcamp
//route     put /api/v1/courses/:id
//access    private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id : ${req.params.id} found `, 404)
    );
  }
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id : ${req.user.id} not authorized to add a course to bootcamp with id: ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// desc     delete a course for a bootcamp
//route     delete /api/v1/courses/:id
//access    private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id : ${req.params.id} found `),
      404
    );
  }
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id : ${req.user.id} not authorized to add a course to bootcamp with id: ${course._id}`,
        401
      )
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
