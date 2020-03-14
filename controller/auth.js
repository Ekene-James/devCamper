const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncMiddleware");
const sendMail = require("../utils/nodeMailer");
const crypto = require("crypto");

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });
  sendTokenResponse(user, 200, res);
});

// desc     login
//route     post /api/v1/auth/login
//access    public
exports.login = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;
  if (!password || !email) {
    return next(
      new ErrorResponse("please provide your email and password", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("invalid email or password", 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("invalid email or password", 401));
  }

  sendTokenResponse(user, 200, res);
});

//get token from model, sign and send token via response and cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token
    });
};

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 401));
  }
  res.status(200).json({ success: true, data: user });
});

// desc     forgot password
//route     post /api/v1/auth/forgotpassword
//access    public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("No User with such email found", 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}//api/v1/auth/resetpassword/${resetToken}`;
  const message = `you are receiving this email because you (or someone else) has requested the reset of a password,please make a PUT request to: \n\n\ ${resetUrl} `;

  try {
    await sendMail({
      message,
      subject: "password reset email",
      email: user.email
    });
    res.status(200).json({
      success: true,
      data: "email sent"
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});
// desc     reset password
//route     post /api/v1/auth/resetpassword/:resettoken
//access    public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //hash the token gotten back from the url
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  console.log("controller hashed :" + resetPasswordToken);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse("invalid token", 400));
  }

  //set new password
  user.password = req.body.password;
  //set ressetpasswordtoken & resetpasswordexpire to undefned
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  //save these changes to database
  await user.save();

  sendTokenResponse(user, 200, res);
});

// desc     update logged in user details
//route     put /api/v1/auth/updatedetails
//access    private
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    email: req.body.email,
    name: req.body.name
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

// desc     update logged in user password
//route     put /api/v1/auth/updatepassword
//access    private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("password is incorrect", 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// desc     logout user
//route     get /api/v1/auth/logout
//access    private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, data: {} });
});
