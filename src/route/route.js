const express= require("express")
const router = express.Router();

const userController=require('../Controllers/userController')
const bookController=require('../Controllers/bookController')
const middlware=require('../Middleware/auth')
const reviewController=require('../Controllers/reviewController')



router.post('/register',userController.createuser)
router.post('/login',userController.loginUser)
router.post('/books',middlware.Authenticate,middlware.AutherizationforCreate,bookController.createBook)
router.get('/books',middlware.Authenticate,bookController.getBooks)
router.delete('/books/:bookId',middlware.Authenticate,middlware.Autherization,bookController.deleteBook)






module.exports = router;