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




const isValidRequest = function (object) {
    return Object.keys(object).length > 0
};


const stringRegex = /^[a-zA-Z\. ]*$/
const ISBNregex=/^[6-9]{3}\-([\d]{10})$/
const releasedAtRgex = /^\d{4}-\d{2}-\d{2}$/;




const createBook = async function (req, res) {
    try {
        if (isValidRequest(req.query))
        return res.status(400).send({ status: false, msg: "Data can passes only through Body" })
        const bookData = req.body;
        if(!isValidRequest(bookData)) return res.status(400).send({status: false, msg:"body is empty"});
        const {title,excerpt,userId,category,subcategory,ISBN,releasedAt}=bookData
       //*********Title VALIDATIONS**************8 */
        if(!isValid(title)) return res.status(400).send({status: false, msg:"title is mandatory and valid"});
        if(!stringRegex.test(title)) return res.status(400).send({status: false, msg:"title can conatin only alphabets"})
        
        const titleData=await bookModel.findOne({title:title})
           if(titleData) return res.status(400).send({status:false,msg:"title already exist "})
  
        
        //***********Excerpt VALIDATIONS**********8 */
  
        if(!isValid(excerpt)) return res.status(400).send({status: false, msg:"excerpt is mandatory and valid"});
          //***********USERID VALIDATION************ */
        
        if(!isValidObjectId(userId)) return res.status(400).send({status:false,msg:"userId is invalid"})
  
       //***********Category VALIDATIONS************ */
  
       if(!isValid(category)) return res.status(400).send({status: false, msg:"category is mandatory and valid"});
       if(!stringRegex.test(category)) return res.status(400).send({status: false, msg:"category can conatin only alphabets"})
       
       if(!isValid(subcategory)) return res.status(400).send({status: false, msg:"subcategory is mandatory and valid"});
       if(!stringRegex.test(subcategory)) return res.status(400).send({status: false, msg:"subcategory can conatin only alphabets"})
         
       //**********Reviews Validations*************** */
        
         if(bookData.reviews){
            if(bookData.reviews>0) return res.status(400).send({status:false,message:"reviews should not be greater than zero"})
         }
         //***********ISBN Validations******************** */
        
         if(!bookData.ISBN) return res.status(400).send({status:false,msg:"ISBN not present"})
  
         if(!(ISBNregex.test(ISBN)))  //(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)
            return res.status(400).send({status: false, msg:" ISBN is not in proper format"});
         const ISBNalreadyused=await bookModel.findOne({ISBN:ISBN})
            if(ISBNalreadyused) return res.status(400).send({status:false,message:"ISBN already used"})
           
            //***********releasedAt Validations******************** */
             if(!releasedAtRgex.test(releasedAt)) return res.status(400).send({status:false,message:"releasedAt is mandatory and have yyyy-mm-dd format only"})

        const saveData = await bookModel.create(bookData);
        return res.status(201).send({ status: true, msg: "book created successfully", data: saveData });
    } catch (error) {
        return res.status(500).send({ staus: false, error: error.message })
    }
  };

  

const getBooks = async function (req, res) {
    try {
        if (isValidRequest(req.body))
            return res.status(400).send({ status: false, msg: "filters can passes only through query params" })
        const queryParams = req.query
        let filterCondition = { isDeleted: false };
        if (isValidRequest(queryParams)) {
            const { userId, category, subcategory} = queryParams;

            if (queryParams.hasOwnProperty("userId")) {
                if (!isValidObjectId(userId))  return res.status(400).send({ status: false, message: "Enter a valid userId" });
                const userByUserId = await userModel.findById(userId);
                if (!userByUserId) return res.status(400).send({ status: false, message: "no author found" })
                filterCondition["userId"] = userId;
            }
            if (queryParams.hasOwnProperty("category")) {
                if (!isValid(category)) return res.status(400).send({ status: false, message: "book category should be in valid format" });
                filterCondition["category"] = category.trim();
            }
            if (queryParams.hasOwnProperty("subcategory")) {
                    if (!isValid(subcategory)) return res.status(400).send({ status: false, message: "book subcategory must in valid format" });
                    filterCondition["subcategory"] = subcategory.trim();
            }
            const filetredBooks = await bookModel.find(filterCondition).select({ISBN:0,createdAt:0,updatedAt:0,isDeleted:0,subcategory:0,"__v":0,deletedAt:0});

            if (filetredBooks.length == 0) return res.status(404).send({ status: false, message: "no books found" });

            return res.status(200).send({ status: true, message: "filtered book list", booksCount: filetredBooks.length, bookList: filetredBooks.sort() })


        } else {
                  const allBooks = await bookModel.find(filterCondition).select({ISBN:0,createdAt:0,updatedAt:0,isDeleted:0,subcategory:0,"__v":0,deletedAt:0});
                  if (allBooks.length == 0) return res.status(404).send({ status: false, message: "no books found" })
                  let sortedBooks= lodash.sortBy(allBooks, [function(o) { return o.title; }]);
                  
                  return  res.status(200).send({ status: true, message: "book list", booksCount: allBooks.length, booksList: sortedBooks});
        }

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}




const reviewModel=require('../Models/reviewModel')

const getBookById=async function(req,res){
  try{
    const bookId=req.params.bookId
    if(!isValidObjectId(bookId))
    return res.status(400).send({status:false,msg:"Please enter valid blogId in params"})
    let book=await bookModel.findById(bookId)
    if(book== null || book.isDeleted==true){
        return res.status(404).send({status:false,message:"No book found with this bookId or it may be deleted"})
    } 
    const filter={
        "bookId":bookId,
        "isDeleted":false
    }
    const review=await reviewModel.find(filter).select({isDeleted:0,"__v":0,createdAt:0,updatedAt:0});
        const requiredOutput={
       "title": book.title,
        "excerpt":book.excerpt,
       "userId":book.userId,
        "category":book.category,
       "subcategory" :book.subcategory,
       "isDeleted":book.isDeleted,
       "reviews":book.reviews,
       "releasedAt":book.releasedAt,
       "createdAt":book.createdAt,
      "updatedAt":book.updatedAt,
    "reviewsData":review
     }
    
    return res.status(200).send({status:true,message:"Book Data",data:requiredOutput})
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
        if(checkBook==null || checkBook.isDeleted==true){
            return res.status(404).send({status:false,message:"No book found with this bookId or may be book is deleted"})
        }
        const bodyData=req.body
        if(!isValidRequest(bodyData)){
            return res.status(400).send({status:false,message:"Please enter filters for update book"})
        }
        const {title,excerpt,releasedAt,ISBN}=bodyData
        let dataForUpdate={ }
        if(title){
            if(!stringRegex.test(title)) return res.status(400).send({status: false, msg:"title can conatin only alphabets"})
            const checktitle=await bookModel.findOne({"title":title})
            if(checktitle) return res.status(400).send({status:false,message:"A book with this title already present, Use another title"})
            dataForUpdate.title=title
        }
        if(ISBN){
            if(!(ISBNregex.test(ISBN)))  
            return res.status(400).send({status: false, msg:" ISBN is not in proper format"});
            const checkISBN=await bookModel.findOne({"ISBN":ISBN})
            if(checkISBN) return res.status(400).send({status:false,message:"A book with this ISBN already present, Use another ISBN"})
            dataForUpdate.ISBN=ISBN
        }
        if(excerpt){
            dataForUpdate.excerpt=excerpt
        }
        if(releasedAt){
            if(!releasedAtRgex.test(releasedAt)) return res.status(400).send({status:false,message:"releasedAt is mandatory and have yyyy-mm-dd format only"})
            dataForUpdate.releasedAt=releasedAt
        }
        dataForUpdate.isDeleted=false
        
        const updatebk=await bookModel.findByIdAndUpdate(
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
        let bookbyBookId=await bookModel.findOne({_id:bookId,isDeleted:false})
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