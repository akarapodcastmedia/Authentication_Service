const schema = require("mongoose");
const uuid   = require("node-uuid");
// create mongoose schema  

//====================== Generate Schema ====================
//*********************************************************** */

// | Sign up schema :

const SignUpSchema = new schema.Schema({
    _id : {
        type : String ,
        default : function getUUID(){
            return uuid.v1()
        }
    },
    username : {
         type : String,
          required : true
    },
    email : {
        type : String ,
        required : true ,
        unique : true
    },
    password : {
        type : String ,
        required : true
    },
    confirm : {
        type : String,
        required : true   
    },
    role: {
        type : [String],
        enum : ["user","podcaster","admin","super_admin"],
        default : ["user"]
    },
    personal_secret : {
        type : String ,
        default : null
    },
    accessToken : {
        type : String,
        default : null
    },
    refreshToken: {
        type : String,
        default : null
    }
},{timestamps : true , versionKey: false});

// | Token schema :

const tokenSchema = schema.Schema({
    _id : {
        type : String,
        default : function getUUID(){return uuid.v1()}
    },
    user : {
        type : String,
        default : null
    },
    grantType : {
        type : String,
        default : null
    }
    ,
    clientId:{
        type : String,
        required: true
    },
    clientSecret: {
        type : String,
        required : true
    },
    accessToken : {
        type : String ,
        default : null
    },
    refreshToken : {
        type : String,
        default: null
    },
    scope : {
        type : String,
        default : null
    },
    accessExp : {
        type : String,
        default : null
    },
    refreshExp : {
        type : String,
        default : null
    }
},{timestamps : true, versionKey:false})



//====================== Generate Models ====================
//*********************************************************** */
const signupModel = schema.model("signupmodels",SignUpSchema);
const tokenModel  = schema.model("tokenModels",tokenSchema);


///----------------------------------------------------------
// export the schema
module.exports={signupModel,tokenModel};