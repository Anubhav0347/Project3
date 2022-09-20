const userModel=require("../Models/userModel")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
};

const isValidRequest = function (object) {
    return Object.keys(object).length > 0
};
const isValidTitle = function(title){
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
  }
const createuser=async function(req,res){
    try {
        const nameregex = /^[a-zA-Z ]*$/
        phoneregex=/^([6-9]\d{9})$/
        emailregex=/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        passwordregex="/^(?=.\d)(?=.[a-zA-Z]).{8,15}$/"
        let reqquery=req.query
        if(isValidRequest(reqquery))
         return res.status(400).send({ status: false, msg: "invalidRequest" })
        let reqbody=req.body
        if(!isValidRequest(reqbody))
         return res.status(400).send({ status: false, msg: "body should not be empty" })
        const { title,name, phone,email, password,address} = requestBody 
        if(!isValid(title)) 
         return res.status(400).send({status: false, msg: "title is required"})
        if(!isValidTitle(title)) 
         return res.status(400).send({status: false, msg: "title shoud be among Mr, Mrs, and Miss"})
        if(!isValid(name))
         return res.status(400).send({status: false, msg: "name is required"})
        if (!name.match(nameregex))
         return res.status(400).send({ status: false, msg: "name must be in a valid format" })
        if (!isValid(phone))
         return res.status(400).send({ status: false, msg: "phone number must be prasent" })
        if (!phone.match(phoneregex))
         return res.status(400).send({ status: false, msg: "phone number must be in a valid format" })
        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone })
        if (isPhoneAlreadyUsed)
          return res.status(400).send({ status: false, msg: "phone number already registered" })
        if(!isValid(email))
         return res.status(400).send({status: false, msg: "email is required"})
        if (email.match(emailregex))
         return res.status(400).send({status: false, msg: "email should be valid"})
        let emailAlreadyUsed=await userModel.findOne({email:email})
        if(emailAlreadyUsed)
         return res.status(400).send({ status: false, msg: "email already registered" })
        if(!isValid(password))
         return res.status(400).send({status: false, msg: "password is required"})
        if (email.match(passwordregex))
         return res.status(400).send({status: false, msg: "password should be valid"})
        if(!isValid(address))
         return res.status(400).send({status: false, msg: "address is required"})
         const userData= {title,name, phone,email, password, address}
         const newUser = await userModel.create(userData)
         return res.status(201).send({status: true, msg: "user created successfully", data: newUser})
    } catch (error) {
        return res.status(500).send({status:false,msg:Message.error})
    }
}

const loginUser = async function (req, res) {
    try {
        let emailId = req.body.email
        let password = req.body.password
        if (!emailId || !password) {
            return res.status(400).send({ status: false, msg: "please enter email and password" })
        }
    
        const user = await userModel.findOne({ email: emailId, password: password })
        if (!user) {
            return res.status(400).send({ status: false, msg: "email or password is not correct" })
        } else {
            const token = jwt.sign({
                 userId: user._id.toString(),
                 expiresIn: '365d' 
                },"Group34-Project-BookManagment");
            res.setHeader("x-api-key", token);
            res.status(201).send({ status: true,message: 'Success', data: token })
        }
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
    
    }

module.exports.createuser=createuser
module.exports.loginUser= loginUser