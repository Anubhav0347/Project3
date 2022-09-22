const userModel = require("../Models/userModel")
const jwt = require('jsonwebtoken')
const isNotEmpty=function(value){
    if(value.trim().length!=0)
    return true; 
    return false;
}

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
};

const isValidRequest = function (object) {
    return Object.keys(object).length > 0
};
const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}
const nameregex = /^[a-zA-Z\. ]*$/
const phoneregex = /^([6-9]\d{9})$/
const emailregex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
const passwordregex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/
const pinregex=       /^\d{6}$/
const streetregex=/^[0-9\\\/# ,a-zA-Z]+[ ,]+[0-9\\\/#, a-zA-Z]{1,}$/

const createuser = async function (req, res) {
    try {
        let reqquery = req.query
        if (isValidRequest(reqquery))
            return res.status(400).send({ status: false, msg: "Data can passes only through request body" })
        let reqbody = req.body
        if (!isValidRequest(reqbody))
            return res.status(400).send({ status: false, msg: "body should not be empty" })
        const { title, name, phone, email, password, address } = reqbody
        if (!isValid(title))
            return res.status(400).send({ status: false, msg: "title is required" })
        if (!isValidTitle(title))
            return res.status(400).send({ status: false, msg: "title shoud be among Mr, Mrs, and Miss" })
        if (!isValid(name))
            return res.status(400).send({ status: false, msg: "name is required" })
        if (!name.match(nameregex))
            return res.status(400).send({ status: false, msg: "name must be in a valid format" })
        if (!isValid(phone))
            return res.status(400).send({ status: false, msg: "phone number must be prasent" })
        if (!phone.match(phoneregex))
            return res.status(400).send({ status: false, msg: "phone number must be in a valid format" })
        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone })
        if (isPhoneAlreadyUsed)
            return res.status(400).send({ status: false, msg: "phone number already registered" })
        if (!isValid(email))
            return res.status(400).send({ status: false, msg: "email is required" })
        if (!email.match(emailregex))
            return res.status(400).send({ status: false, msg: "email should be valid" })
        let emailAlreadyUsed = await userModel.findOne({ email: email })
        if (emailAlreadyUsed)
            return res.status(400).send({ status: false, msg: "email already registered" })
        if (!isValid(password))
            return res.status(400).send({ status: false, msg: "password is required" })
        if (!password.match(passwordregex))
            return res.status(400).send({ status: false, msg: "password should be valid" })
        if (address) {
            if (Object.keys(address).length == 0) return res.status(400).send({ status: false, msg: "Address must contain street, city, pincode" })
            else {
                const { street, city, pincode } = address
                if (!(isValid(street) || isValid(city) || isValid(pincode))) return res.status(400).send({ status: false, msg: "We are looking for street ,city or pincode value only inside Address Object" })
                else {
                    if (street) {
                        if (!isValid(street)) return res.status(400).send({ status: false, msg: "street field is empty" });
                        if (!street.match(streetregex)) return res.status(400).send({ status: false, msg: "street is invalid" })
                        address.street = street.trim()
                    } 
                    if (city) {
                        if (!isNotEmpty(city)) return res.status(400).send({ status: false, msg: "city field is empty" });
                        if (!city.match(nameregex)) return res.status(400).send({ status: false, msg: "city name is not valid" })
                        address.city = city.trim()
                    } if (pincode) {
                        if (!isNotEmpty(pincode)) return res.status(400).send({ status: false, msg: "pincode field is empty" });
                        if (!pincode.match(pinregex)) return res.status(400).send({ status: false, msg: "pincode must contain only digit with 6 length" })
                        address.pincode = pincode.trim()
                    }
                }
            }
        }
            const userData = { title, name, phone, email, password, address }
            const newUser = await userModel.create(userData)
            return res.status(201).send({ status: true, msg: "user created successfully", data: newUser })

    } catch (error) {
            return res.status(500).send({ status: false, msg: error.message })
        }
}

const loginUser = async function (req, res) {
        try {
            let emailId = req.body.email
            let password = req.body.password
            if (!emailId || !password) {
                return res.status(400).send({ status: false, msg: "please enter email and password" })
            }
            if (!emailId.match(emailregex))
                return res.status(400).send({ status: false, msg: "email should be valid" })
            if (!password.match(passwordregex))
                return res.status(400).send({ status: false, msg: "password should be valid" })

            const user = await userModel.findOne({ email: emailId, password: password })
            if (!user) {
                return res.status(400).send({ status: false, msg: "email or password is not correct" })
            } else {
                const token = jwt.sign({
                    userId: user._id.toString(),
                    exp: Math.floor(Date.now()/100)
                }, "Group34-Project-BookManagment");
                res.setHeader("x-api-key", token);
                return res.status(201).send({ status: true, message: 'Success', data: token })
            }
        } catch (error) {
            return res.status(500).send({ status: false, error: error.message })
        }
    }

    module.exports.createuser = createuser
    module.exports.loginUser = loginUser