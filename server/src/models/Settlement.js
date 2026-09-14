const mongoose = require('mongoose');
const settlementSchema = new mongoose.Schema({
  roomCode: {
    type : String,
    required : true,
    index : true,
  },from: {
      memberId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },

    to: {
      memberId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    status: {
      type: String,
      enum: ["PAID"],
      default: "PAID",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Settlement", settlementSchema);