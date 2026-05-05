const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const regiSchema = new Schema({
    name :{
        type:String,
        required:true,
    },
    gmail:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type :String,
        required:true,
    },
    password:{
        type :String,
        required:true,
    },
     conPassword:{
        type :String,
        required:true,
    },
    role:{
        type:String,enum: ["user","artisan","admin","delivery"],default:"user"
    }
});

module.exports = mongoose.model(
    "Register",
    regiSchema
)