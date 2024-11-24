const express = require("express");

const {
  signupUser,
  signinUser,
  getUserHistory,
  logoutUser,
} = require("../controllers/user");
const { getUserDetails } = require("../controllers/user");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/signin", signinUser);
router.post("/history", getUserHistory);
router.post("/logout", logoutUser);
router.get("/:email", getUserDetails);
module.exports = router;
