const express= require("express")
const router = express.Router();

const userController=require('../Controllers/userController')
const bookController=require('../Controllers/bookController')
const reviewController=require('../Controllers/reviewController')



router.post('/register',userController.createuser)
router.post('/login',userController.loginUser)








module.exports = router;