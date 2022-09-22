    const bookModel = require("../Models/bookModel");
    const reviewModel = require("../Models/reviewModel");
    const mongoose=require('mongoose')
   
    
    const isValid = function (value) {
      if (typeof value === "undefined" || value === null) return false;
      if (typeof value === "string" && value.trim().length > 0) return true;
      return false;
    };
    
    const isValidObjectId = function (objectId) {
      return mongoose.Types.ObjectId.isValid(objectId)
    }
    
    const isValidRequest=(object)=>{
      return Object.keys(object).length>0
      }
    
      const isValidRvwd = function (value) {
        if (typeof value === "undefined" || value === null) return false;
        if ( typeof value === Date && value.trim().length > 0) return true;
        return false;
    };
    
    const isValidRating = function (value) {
      if (typeof value === "undefined" || value === null) return false;
      if ( typeof value === "Number" && value.trim().length > 0) return true;
      
      return false;
    };
    

    const reviewedByRegex=/^[a-zA-Z\. ]*$/
    const ratingRegex=/^[0-5](.[0-9][0-9]?)?$/
    //===================================POST API Review=======================================================
      
    const createReview = async function (req, res) {
        try {
          if (isValidRequest(req.query)) return res.status(400).send({ status: false, msg: "Data can passes only through Body" })
    
            let reviewData = req.body;
            const bookId=req.params.bookId
            if(!isValidObjectId(bookId)) return res.status(400).send({status:false,msg:"book ID not valid"})
            let bookbyBookId=await bookModel.findOne({_id:bookId, isDeleted:false})
            if(!bookbyBookId) return res.status(400).send({status:false,msg:"No book Id exist"})
            
            let {reviewedBy,rating, review}=reviewData 
            reviewData['reviewedAt']=Date.now()
            reviewData['bookId']=bookId  

            if(!isValidRequest(reviewData)) return res.status(400).send({status: false, msg:"body is empty!"});

            //***************REVIEWED BY VALIDATIONS****************** 
            if(!isValid(reviewedBy)) return res.status(400).send({status:false,msg:"reviewed by is required"});
        
            if((reviewedByRegex.test(reviewedBy))) return res.status(400).send({status: false, msg:"reviewed by is not in proper format"});
    
            //***************RATING VALIDATIONS******************
            if(!(rating)) return res.status(400).send({status:false,msg:"rating is required"})
             
            if(!(ratingRegex.test(rating))) return res.status(400).send({status: false, msg:"rating is not in proper format"});
              
            //***************REVIEW VALIDATIONS******************
            if(!review) return res.status(400).send({status:false,msg:"review is invalid"})
    
                
            let saveData = await reviewModel.create(reviewData)
            let updateData= await bookModel.findOneAndUpdate({"_id":bookId},
                {$set:{"reviews":bookbyBookId.reviews+1}}, 
                {new:true})
               
             saveData['isDeleted']=undefined
             saveData['__v']=undefined
             saveData['reviewedAt']=undefined
             saveData['updatedAt']=undefined
            return res.status(201).send({ status: true, msg: "review created successfully", data: saveData });
        } catch (error) {
            return res.status(500).send({ staus: false, msg: error.message })
        }
      };
    


//=====================================Update API REVIEW========================================================
    

  const updateReview=async function(req,res){
    try{
            if (isValidRequest(req.query)) return res.status(400).send({ status: false, msg: "Data can passes only through Body" })
        const bookId=req.params.bookId
         if(!isValidObjectId(bookId))
        return res.status(400).send({status:false,msg:"Please enter valid blogId in params"})
        let book=await bookModel.findById(bookId)
        if(book==null  || book.isDeleted==true){
            return res.status(404).send({status:false,message:"No book found with this bookId or it may be deleted"})
        } 
        const reviewId=req.params.reviewId
        if(!isValidObjectId(reviewId))
        return res.status(400).send({status:false,msg:"Please enter valid reviewId in params"})
        console.log(reviewId)
        const checkreview=await bookModel.findById(reviewId)
        console.log(checkreview)
        if(checkreview==null || checkreview.isDeleted==true ){
            return res.status(404).send({status:false,message:"No review found with this reviewId or may be it deleted"})
        } 
        if(reviewId.bookId !== bookId){
            return res.status(400).send({status:false,message:"bookId in reviewId is not matches with which you provided"})
        }
       const requestBody=req.body
       if(!isValidRequest(requestBody)){
        return res.status(400).send({status:false,message:"Please enter details for update review"})
       }
    
       let{review, rating,reviewedBy}=requestBody
       let dataForUpdate={ }
       if(review){

         dataForUpdate.review=review
       }
       if(rating){
        if(!(ratingRegex.test(rating))) return res.status(400).send({status: false, msg:"rating is not in proper format"});
        dataForUpdate.rating=rating
       }
       if(reviewedBy){
        if((reviewedByRegex.test(reviewedBy))) return res.status(400).send({status: false, msg:"reviewed by is not in proper format"});
        dataForUpdate.reviewedBy=reviewedBy
       }
       
       const updatedata=await reviewModel.findByIdAndUpdate(
        {reviewId},///condition
        { dataForUpdate},//updation
        {new:true})
        
        book['reviewsData']=updatedata
       return res.status(200).send({status:true,message:"Success",data:book})
    }
    catch(errr){
        return res.status(500).send({status:false,error:err.message})
    }
    
    }
    //=====================================DELETE API REVIEW========================================================
    
    const deleteReview = async function (req, res) {
          try {
            let bookIdData = req.params.bookId;
             if(!isValid(bookIdData)) return res.status(400).send({status:false,msg:"book ID required"})
    
             if(!isValidObjectId(bookIdData)) return res.status(400).send({status:false,message:"Please enter valid bookId in params"})
        
            let book = await bookModel.findById(bookIdData);
    
            if (book.isDeleted === true) {
              return res.status(404).send({ status: false, message: "No book exists" });
            }
    
            let reviewIdData = req.params.reviewId;
            if(!isValid(reviewIdData)) return res.status(400).send({status:false,msg:"review ID required"})
             
            if(!isValidObjectId(reviewIdData)) return res.status(400).send({status:false,message:"Please enter valid reviewId in params"})
       
            let review = await reviewModel.findById(reviewIdData);
            
            if (review.isDeleted === true) {
              return res.status(404).send({ status: false, message: "No review exists" });
            }
        
            let deletedReview = await reviewModel.findOneAndUpdate(
              { _id: reviewIdData },
              { isDeleted: true, deletedAt: new Date(), new: true }
            );
    
            let updatedReview= await bookModel.findOneAndUpdate({_id:bookIdData},{review:count-1, new:true})
    
            res.status(200).send({ status: true, data: updatedReview, deletedReview });
          } catch (error) {
            res.status(500).send({ status: false, Error: error.message });
          }
        };
    
    
    



module.exports.createReview=createReview
module.exports.updateReview=updateReview
module.exports.deleteReview= deleteReview
