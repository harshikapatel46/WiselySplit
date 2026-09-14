const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    baseCurrency: {
      type: String,
      default: "INR",
    },
    members: [
      {
        memberId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Room", roomSchema);
