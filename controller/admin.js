const User = require("../models/User");

const asyncHandler = require("../middleware/asyncMiddleware");

// desc     get all users
//route     get /api/v1/admin
//access    private

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// desc     get single user
//route     get /api/v1/admin/:id
//access    private

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({ success: true, data: user });
});

// desc     create a user
//route     post /api/v1/admin/
//access    private

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

// desc     update a user
//route     put /api/v1/admin/:id
//access    private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

// desc     delete a user
//route     delete /api/v1/admin/:id
//access    private

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
