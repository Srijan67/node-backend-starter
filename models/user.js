const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter full name"],
    },
    mobile: {
      type: Number,
      required: [true, "please Enter Your mobile number"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: String,
    userName: {
      type: String,
      unique: true,
    },
    userType: {
      type: String,
      enum: ["admin", "operator", "user"],
      default: "user",
    },
    image: {
      type: String,
      default: "default.jpeg",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", UserSchema);
