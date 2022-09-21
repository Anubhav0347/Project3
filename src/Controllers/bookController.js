const bookModel = require("../Models/bookModel")
const userModel=require("../Models/userModel")
const mongoose=require("mongoose")
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
};
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
};
const isValidObject=(object)=>{
    return Object.keys(object).length>0
    }
const isValidSubcategory = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    if (typeof value === "object" && Array.isArray(value) === true) return true;
    return false;
};


const isValidRequest = function (object) {
    return Object.keys(object).length > 0
};
const createBook = async function (req, res) {
    try {
        let bookData = req.body;
        let {title,excerpt,userId,category,subcategory,ISBN,releasedAt}=bookData
        
        if(!isValidRequest(bookData)) return res.status(400).send({status: false, msg:"body is empty"});
  
       //*********Title VALIDATIONS**************8 */
        if(!isValid(title)) return res.status(400).send({status: false, msg:"title is not valid"});
        
        let titleData=await bookModel.findOne({title:title})
           if(titleData) return res.status(400).send({status:false,msg:"title already exist "})
  
        
        //***********Excerpt VALIDATIONS**********8 */
  
        if(!isValid(excerpt)) return res.status(400).send({status: false, msg:"excerpt is not valid"});
        
        let excerptData=await bookModel.findOne({excerpt:excerpt})
           if(excerptData) return res.status(400).send({status:false,msg:"excerpt already exist "})
  
        //***********USERID VALIDATION************ */
        
        if(!isValidObjectId(userId)) return res.status(400).send({status:false,msg:"userId is invalid"})
  
       //***********Category VALIDATIONS************ */
  
         if(!isValidSubcategory(category)) return res.status(400).send({status:false,msg:"Category not valid"})
  
         if(!isValidSubcategory(subcategory)) return res.status(400).send({status:false,msg:"Subcategory not valid"})
  
         //**********Reviews Validations*************** */
        
         //  if(!reviews) return res.status(400).send({status:false,msg:"Review not present"})
  
        //  if(typeof reviews !== Number) return res.status(400).send({status:false,msg:"Review is not in proper format"})
  
         //***********ISBN Validations******************** */
        
         if(!bookData.ISBN) return res.status(400).send({status:false,msg:"ISBN not present"})
  
         if(!(/^[6-9]{3}\-([\d]{10})$/.test(ISBN)))  //(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)
            return res.status(400).send({status: false, msg:" ISBN is not in proper format"});
  
            
        let saveData = await bookModel.create(bookData);
        return res.status(201).send({ status: true, msg: "book created successfully", data: saveData });
    } catch (error) {
        return res.status(500).send({ staus: false, msg: error.message })
    }
  };
const getBooks = async function (req, res) {
    try {
        let queryParams = req.query

        let reqbody = req.body
        if (isValidRequest(reqbody))
            return res.status(400).send({ status: false, msg: "invalidRequest" })
        const filterCondition = { isDeleted: false, deletedAt: null };
        if (isValidRequest(queryParams)) {
            const { userId, category, subcategory } = queryParams;

            if (queryParams.hasOwnProperty("userId")) {
                if (!isValidObjectId(userId)) {
                    return res
                        .status(400)
                        .send({ status: false, message: "Enter a valid userId" });
                }
                const userByUserId = await userModel.findById(userId);

                if (!userByUserId) {
                    return res
                        .status(400)
                        .send({ status: false, message: "no author found" })
                }
                filterCondition["userId"] = userId;
            }
            if (queryParams.hasOwnProperty("category")) {
                if (!isValid(category)) {
                    return res.status(400).send({ status: false, message: "book category should be in valid format" });
                }
                filterCondition["category"] = category.trim();
            }
            if (queryParams.hasOwnProperty("subcategory")) {
                if (Array.isArray(subcategory)) {
                    for (let i = 0; i < subcategory.length; i++) {
                        if (!isValid(subcategory[i])) {
                            return res.status(400).send({ status: false, message: "book subcategory must be in valid format" });
                        }
                        filterCondition["subcategory"] = subcategory[i].trim();
                    }
                } else {
                    if (!isValid(subcategory)) {
                        return res
                            .status(400)
                            .send({ status: false, message: "book subcategory must in valid format" });
                    }
                    filterCondition["subcategory"] = subcategory.trim();
                }
            }
            const filetredBooks = await bookModel.find(filterCondition)

            if (filetredBooks.length == 0) {
                return res
                    .status(404)
                    .send({ status: false, message: "no books found" });
            }

            res
                .status(200)
                .send({ status: true, message: "filtered blog list", blogsCounts: filetredBooks.length, bookList: filetredBooks })


        } else {
            const allBooks = await bookModel.find(filterCondition);

            if (allBooks.length == 0) {
                return res
                    .status(404)
                    .send({ status: false, message: "no books found" })
            }
            res
                .status(200)
                .send({ status: true, message: "book list", booksCount: allBooks.length, booksList: allBooks.sort()});
        }

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}






const getBookById=async function(req,res){
  try{
    const bookId=req.params.bookId
    if(!isValidObjectId(bookId))
    return res.status(400).send({status:false,msg:"Please enter valid blogId in params"})
    const book=await bookModel.findById(bookId)
    if(book==Null){
        return res.status(404).send({status:false,message:"No book found with this bookId"})
    } 
    const reviews=await reviewModel.find({"bookId":bookId})
    book.reviewsData=reviews
    return res.status(200).send({status:true,message:"Book Data",data:book})
  }
  catch(err){
    return res.status(500).send({status:false,error:err.message})
  }
    
}


const updateBook=async function(req,res){
    try{
        const bookId=req.params.bookId
        if(!isValidObjectId(bookId))
        return res.status(400).send({status:false,message:"Please enter valid blogId in params"})
        const checkBook=await bookModel.findById(bookId)
        if(checkBook==Null || checkBook.isDeleted==true){
            return res.status(404).send({status:false,message:"No book found with this bookId or may be book is deleted"})
        }
        const bodyData=req.body
        if(!isValidObject(bodyData)){
            return res.status(400).send({status:false,message:"Please enter filters for update book"})
        }
        const {title,excerpt,releasedAt,ISBN}=bodyData
        let dataForUpdate={ }
        if(title){
            const checktitle=await bookModel.findOne({"title":title})
            if(checktitle) return res.status(409).send({status:false,message:"A book with this title already present, Use another title"})
            dataForUpdate.title=title
        }
        if(ISBN){
            const checkISBN=await bookModel.findOne({"ISBN":ISBN})
            if(checkISBN) return res.status(409).send({status:false,message:"A book with this ISBN already present, Use another ISBN"})
            dataForUpdate.ISBN=ISBN
        }
        if(excerpt){
            dataForUpdate.excerpt=excerpt
        }
        if(releasedAt){
            dataForUpdate.releasedAt=releasedAt
        }
        
        const updatebk=await fineByIdAndUpdate(
            {_id:bookId},//filters
            { $set:dataForUpdate},
            {new:true}
        )

    return res.status(200).send({status:true,message:"Updated Sucessfully",data:updatebk})      

    }
    catch(err){
      return res.status(500).send({status:false,error:err.message})
    }

}


const deleteBook=async function (req,res){
    try {
        let reqbody=req.body
        if(isValidRequest(reqbody)) return res.status(400).send({status:false,msg:"invalid request"})
        let reqquery=req.query
        if(isValidRequest(reqquery)) return res.status(400).send({status:false,msg:"invalid request"})
        let bookId=req.params.bookId
        if (!isValidObjectId(bookId))  return res.status(400).send({ status: false, message: `${id} is not a valid bookId` });
        let bookbyBookId=await bookModel.findOne({_id:bookId,deletedAt:null,isDeleted:false})
        if(!bookbyBookId) return res.status(400).send({status:false,msg: `no blog found by ${bookId}`})
        await bookModel.findByIdAndUpdate({ _id: blogId },{ $set: { isDeleted: true, deletedAt: Date.now() } },{ new: true })
        return res.status(200).send({status:false,mag:"book deleted successfully"})
    } catch (error) {
        return res.status(500).send({ status: false, msg: message.error })
    }
}
module.exports.createBook=createBook
module.exports.getBooks=getBooks
module.exports.deleteBook=deleteBook
module.exports.getBookById=getBookById
module.exports.updateBook=updateBook