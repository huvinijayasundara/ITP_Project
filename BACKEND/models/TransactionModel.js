const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    transaction_ID:{
        type:String,//data type
        required:true,//validate
    },
    order_ID:{
        type:String,
        required:true,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
    },
    user_type:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        required:true, 
    },
    status:{
        type:String,
        required:true,
    },
    type: { 
    type: String, 
    enum: ["Payment", "Refund"], 
    default: "Payment" 
  }
});

module.exports = mongoose.model(
    "TransactionModel",//file mame
    transactionSchema//function
)    





































































































































































































