const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema({
    
        title: {type:String, required:true, unique:true},
        excerpt: {type:String, required:true}, 
        userId: {type:objectId,required:true, ref:"User"},
        ISBN: {type:String, required:true, unique:true},
        category: {type:String,required:true},
        subcategory: [String],
        reviews: {type:Number, default: 0}, //, comment: Holds number of reviews of this book
        deletedAt: {type:Date}, 
        isDeleted: {type:Boolean, default: false},
        releasedAt: {type:Date, required:true} //, format("YYYY-MM-DD")
        
},{timestamps:true});


module.exports = mongoose.model("Book", bookSchema)