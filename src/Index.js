const express= require("express")
const bodyParser= require("body-parser")
const route= require("./route/route")
const mongoose= require("mongoose")
const app= express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect("mongodb+srv://yachika03:wkaTIq3zkjIou3YI@cluster0.t9qdtvx.mongodb.net/group34Database",                                                 
   { useNewUrlParser:true

   }).then(()=> console.log("MongoDB is connected"))
    .catch((err)=>console.log(err))

    app.use('/', route)

    app.listen(process.env.PORT|| 3001, function() {
        console.log("Express app running on port "+(process.env.PORT|| 3001) )
    } )
