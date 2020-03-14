const path = require("path");
const Bootcamps = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncMiddleware");

// desc     get all bootcamps
//route     get /api/v1/bootcamps
//access    public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// desc     get single bootcamp
//route     get /api/v1/bootcamps/:id
//access    public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamps.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp with id : ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// desc     post bootcamp
//route     post /api/v1/bootcamps/
//access    public
exports.postBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  //make sure publishers can only post one bootcamp but admin can do anytn
  const publishedBootcamp = await Bootcamps.findOne({ user: req.user.id });
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `user with ID : ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamps.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});

// desc     update single bootcamp
//route     put /api/v1/bootcamps/:id
//access    public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamps.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp with id : ${req.params.id} not found`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id : ${req.user.id} not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamps.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: bootcamp });
});

// desc     delete single bootcamp
//route     delete /api/v1/bootcamps/:id
//access    public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamps.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp with id : ${req.params.id} not found`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id : ${req.user.id} not authorized to delete this bootcamp`,
        401
      )
    );
  }
  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// desc     post upload
//route     get /api/v1/bootcamps/:id/photo
//access    public
exports.getFileupload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamps.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp with id : ${req.params.id} not found`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id : ${req.user.id} not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please select a photo to upload`, 404));
  }
  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload only a photo file`, 404));
  }
  if (file.size > process.env.FILE_MAX) {
    return next(
      new ErrorResponse(
        `Please you cant upload photo of more than 1mb size`,
        404
      )
    );
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(
        new ErrorResponse(`Problem uploading file, please try again later`, 500)
      );
    }
    await Bootcamps.findByIdAndUpdate(req.params.id, {
      photo: file.name
    });

    res.status(200).json({ success: true, data: file.name });
  });
});
