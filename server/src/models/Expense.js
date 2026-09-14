const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    roomCode:{
      type : String,
      required : true
    },
    description :{
      type : String,
      required : true,
      trim : true
    },
    amount :{
      type : Number,
      required : true,
      min :0
    },
    currency :{
      type : String,
      required : true,  
  },
  paidBy :{
      type : String,
      required : true,
  },
  splitType: {
      type: String,
      enum: ["EQUAL", "EXACT", "PERCENTAGE", "SHARES"],
      default: "EQUAL",
  },
  splitBetween :[
    {
      memberId : {
        type : String,
        required : true
      },
      amount : {
        type : Number,
        required : true,
        
      }
    
    }
  ]
},{
  timestamps : true
}
);
module.exports = mongoose.model("Expense", expenseSchema);
