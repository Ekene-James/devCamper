const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateUserDetails,
  logout
} = require("../controller/auth");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protect, updateUserDetails);
router.put("/updatepassword", protect, updatePassword);
router.put("/me", protect, authorize("publisher", "admin"), getMe);
module.exports = router;
