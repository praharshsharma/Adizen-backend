const mongoose=require("mongoose");

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type: Number,
        default: 0
    },
    countInStock:{
        type:Number,
        required: true,
    },
    image:
        {
            type:String,
            required:true
        }
    
});

module.exports= mongoose.model('Product',productSchema)