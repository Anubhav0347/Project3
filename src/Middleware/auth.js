const jwt = require("jsonwebtoken")

const bookModel = require("../Models/bookModel")

const userModel=require("../Models/userModel")
const Authenticate = async function (req, res, next) {
    try {
        const token = req.headers["x-api-key"]
        if (!token) return res.status(400).send({ status: false, msg: "please provide token" })
        const decodedToken = jwt.verify(token, "Group34-Project-BookManagment")
        if (!decodedToken) return res.status(401).send({ status: false, msg: "invalid token" })
        req.decodedToken = decodedToken;
        next()
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const Autherization = async function (req, res, next) {
    try {
        const bookId = req.params["bookId"]
        const decodedToken = req.decodedToken
        const bookbyBookId = await bookModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })
        if (!bookbyBookId) return res.status(404).send({ status: false, msg: `no books found by ${bookId}` })
        if (decodedToken.userId != bookbyBookId.userId) return res.status(403).send({ status: false, message: "unauthorize access" });
        next()
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}
const AutherizationforCreate = async function (req, res, next) {
    try {
       const userId=req.body.userId
       if(!userId) return res.status(400).send({status:false,msg:"userId is must"})
       console.log(userId)
       const decodedToken = req.decodedToken
       console.log(decodedToken)
       const userbyuserId= await userModel.findOne({_id: userId, isDeleted: false, deletedAt: null})
       console.log(userbyuserId)
       
        if (decodedToken.userId !=userbyuserId._id) return res.status(403).send({ status: false, message: "unauthorize access" });
        next()
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports = { Authenticate, Autherization,AutherizationforCreate}