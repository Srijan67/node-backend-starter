const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter full name"],
    },
    mobile: {
      type: Number,
    },
    email: String,
    password: String,
    userName: String,
    userType: {
      type: String,
      enum: ["admin", "operator", "user"],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", UserSchema);
