// ================================|| ___________ DESKTOP BECKEND FOR FRONT END ___________||=========================
//****************************************************************************************************************** */
// | PURPOSE : acting as a gateway to serve core functionality for others services of AKARA PODCST
// | PROJECT : praticum
// | START AT DATE : 
// | FINISH AT DATE: 
// | LEADED BY : MR.KOR SOKCHEA
// | TEAM COLABORATORS :  -> TAN BUNCHHAY -> NUT VIRAK -> POK HENGLY -> PICH LYHEANG
// | API DESIGNER : MR. PICH LYHEANG
//******************************************************************************************************************* */
// ========================================
// ALLOW ENV AVAILABLE 
//=========================================
require("dotenv").config();

// ========================================
// CONFIGURATION DEPENDENCIES
//=========================================
const express = require("express");
const optsender = express();
const bodyProtector = require("body-parser");
const PORT = 5000 || process.env.PORT;
const {optGenerator} = require("./otpgenerator");
const session = require("express-session");
optsender.use(bodyProtector.json());
optsender.use(bodyProtector.urlencoded({extended : true}));
var cookieParser = require('cookie-parser');
optsender.use(cookieParser());
const cors = require("cors");
optsender.set("trust proxy",1);
optsender.use(cors({
    origin : [process.env.cors_url],
    methods : ["GET","POST","PUT","DELETE"],
    credentials : true
}));
// ========================================
// MODELS SECTION
// =======================================
const {signupModel, tokenModel} = require('./db/shcema');
//=========================================
//==========================================
// TOKEN GENERATOR AND VALIDATOR
//==========================================
const {generateToken,CheckTokenValidation} = require("./Authorized_Endtrypoint");
//=========================================

// =========================================
// VALIDATIONS FEILDS
//==========================================
const {SignUpValidation,LoginValidation,RequestTokenValidation, ForgePassValidation} = require("./db/formvalidation");
//==========================================

// ==============================================
// PASSWORD GENERATOR
//===============================================
const bcryptGenerator = require('bcrypt');
//===============================================

//================================================
// MAIL QUEUE SENDER
//================================================
const {Mailer} = require('./db/Mailer');
//================================================
//================================================
// MIDDLEWARE 
//================================================
const { sessionMiddleware }  = require('./middleware/sessionMiddleware');
// ================================================
// START MONGO DATABASE CONNECTION
//=================================================
try{
    require("./db/mongoConfig")();
}catch(e){
    return res.json({
        error : true,
        message : e.message

    })
}

//=================================================

// =================================================
// REDIS CACHE CONFIGURATION
//==================================================
const redis = require('redis');
const { errorMonitor } = require("bee-queue");
const {refreshMiddleware}  = require('./middleware/refreshTokenMiddleware');
const {desktopLogout} = require('./middleware/desktopLogoutMIddleware');
const  RedisStore  = require("connect-redis").default;
try{
    var redisClient = redis.createClient({
        url : 'redis://cache.akarahub.tech:6379'
    });
     (async()=> await redisClient.connect())();
    redisClient.on('ready',()=> console.log("connect to redis success"));
    redisClient.on('error',(err)=>console.log("error during connecting to redis server ..."));
    // =======================================
}catch(e){
    return res.json({
        error: true,
        message : e.message
    })
}

optsender.use(session({
    name: 'akarapodcast',
    resave : false,
    secret : "welcome to akara",
    saveUninitialized : false,
    store : new RedisStore({
        client : redisClient,
        prefix : "akara:"
    }),
    cookie : {
        secure: true,
        maxAge : 1000*60*60*24,
        sameSite: "none" 
    }
}));
//=======================================
try {
    var redisClient2 = redis.createClient({
        url : 'redis://cache.akarahub.tech:6379',
    });
     (async()=> await redisClient2.connect())();
      
    redisClient2.on('ready',()=> console.log("connect to redis success"));
    redisClient2.on('error',(err)=>console.log("error during connecting to redis server ..."));
}catch(e){
    return res.json({
        error : true,
        message : e.message
    })
}

const proxy = require("express-http-proxy");
const { redirectMiddleware } = require("./util/redirectMiddleware");
const { url_randow } = require("./util/forgetPassLinkGenerator");
//===========================================================
// redirect the user to the rechange password page 
//,redirectMiddleware
optsender.use('/forget/newpassword/:id',redirectMiddleware,proxy("https://jenhpiteas.iteg7.com"));
//===========================================================
// web sign Up 
//===========================================================
let data_for_user = {};
optsender.post("/web/signUp",async(req,res)=>{
    // make validation input fields from user 
    const {value ,error } = SignUpValidation(req.body);
    if(error){
        res.json({
            error : true,
            message : "Check your input again",
            detail : error.message
        })
    }else{
        // go the check the server of this input email or username if there is in the db
            const isUserExist = await signupModel.findOne({username : req.body.username , email : req.body.email});
            if(isUserExist !=null){
                res.json({error : true , message : "You have been already registered before."});
            }else{
                // check if the input password and confirm is matched
                    if(req.body.password !== req.body.confirm) res.json({error : true, message : "Your password not matched"});
                    if(req.body.role == "podcaster" && req.body.personal_secret == null){
                        req.body.role= "podcaster";
                         // insert data to database 
                         const salt = await bcryptGenerator.genSalt(7);
                         const hassPassword = await bcryptGenerator.hash(req.body.password,salt);
                         req.body.password = hassPassword;
                         req.body.confirm = hassPassword;
                         data_for_user = req.body;
                         console.log(data_for_user);
                      
                    }else if(req.body.role == "admin"){
                        // check whether the admin user provide personal secret password
                        if(req.body.personal_secret != null){
                            // insert data to database
                            const salt = await bcryptGenerator.genSalt(7);
                            const hassPassword = await bcryptGenerator.hash(req.body.password,salt);
                            req.body.password = hassPassword;
                            req.body.confirm = hassPassword;
                            data_for_user = req.body;
                            console.log(data_for_user);
                        }else{
                           return res.json({
                                error : true,
                                message : "PLease input your personal secret."
                            })
                        }
                    }else{
                        // check whether the role is podcaser
                        if(req.body.role == "podcaster" && req.body.personal_secret != null){
                            return res.json({
                                error : true,
                                message : "you are not allowed because you are podcaster not required to put personal secret"
                            })
                        }else if(req.body.personal_secret != null){
                            return res.json({
                                error : true,
                                message : "you are not allowed, You are determined to be normal user not require personal secret"
                            })
                        }else{
                             // insert data to database
                                const salt = await bcryptGenerator.genSalt(7);
                                const hassPassword = await bcryptGenerator.hash(req.body.password,salt);
                                req.body.password = hassPassword;
                                req.body.confirm = hassPassword;
                                data_for_user = req.body;
                                console.log(data_for_user);
                        }
                        
                    }
                   
                    // send mail to user 
                     opt = optGenerator();
                     const html = `<h4> Your verify code<span style:"color : red;"> ${opt} </span>keep as a secret</h4>
                     <span > Thanks you for joining us .
                     `;
                     Mailer(req.body.email,html);
                    // await redisClient2.flushAll();
                    redisClient.setEx("opt_code",120000,opt).then(()=> console.log("redis inserted")).catch(e => console.log(e));
                    redisClient.setEx("email_tmp",300000,req.body.email).then(()=> console.log("redis inserted")).catch(e => console.log(e));  
                    // response to the user if you have already been inserted to our system
                    res.json({
                        error : false,
                        message : "You have not been registed successfully, you have 2 minutes to verify this sent code."
                    })
                }    
    }
   

})

optsender.post("/web/signIn",sessionMiddleware,async(req,res)=>{
    console.log("logger")
    const isMatch = await bcryptGenerator.compare(req.body.password, req.password);
    if(isMatch){
        req.session.user= "signed";
        req.session.role= req.role;
        console.log("===",req.role);
        req.session.email = req.body.email;
        const user_id = await signupModel.findOne({email : req.body.email});
        req.session.userId = user_id._id;
        req.session.username = user_id.username;
         // send a message to tell the user 
            const html = `<h4> You have completely logged in to AKARA SYSTEM .</h4>
            <span > Thanks you for joining us </span>.
            `;
        Mailer(req.body.email,html);
        // send response to user 
        return res.json({
            error : false,
            data : {
                email : user_id.email,
                username : user_id.username
            },
            message : "You are logged in successfully",
        })
    }else{
        return res.json({
            error : true,
            message :  "Password is not matched"
        })
    }
   
})
//================================================
//  WEB SIGNOUT OR LOGOUT 
//================================================
optsender.post("/web/logOut",(req,res)=>{
    req.session.destroy();
    res.json({
        error : false ,
        message : "You are logout successfully"
    })
})
// ==============================================
// forget password section 
//===============================================
let startClear = 0;
let emails_new_password =[];
let tmp_email="";
optsender.post("/forgetpassword",async(req,res)=>{
    // validate the email sent 
    startClear++;
    const {error} = ForgePassValidation(req.body);
    // check if there is no error happen
    if(error){
        return res.json({
            error : true,
            message : error.message
        })
    }else{
        // check the second retry
        const checkBeforeStart= await redisClient.get(req.body.email);
        tmp_email=req.body.email;
        if(req.body.email && checkBeforeStart!=null){
            return res.json({
                error : true,
                message : "You are allowed only one requst per 15 minutes"
            })
        }else if(req.body.email && checkBeforeStart==null){
            if(emails_new_password.length>0){
                if(emails_new_password.find(data=> data==req.body.email)){
                    const clearUserexp = emails_new_password.filter(data=>{
                        return data != req.body.email
                    });
                    emails_new_password = clearUserexp;
                }
            }  
        }
        // get the email of the user and find it in the signUpmodel 
        const isUserexist = await signupModel.findOne({email : req.body.email});
        if(isUserexist){
            // check if that email is alrady once request
            const isOncerequest= emails_new_password.find(data=>{
                return data == isUserexist.email
            });
            if(isOncerequest){
                return res.json({
                    error : true,
                    message : "You have already requested once , wait for 15 minutes to make another request"
                })
            }else{
                 // send that email with expiration time
                await redisClient.setEx(`${isUserexist.email}`,60*15,JSON.stringify(req.body.email));
                const email = await redisClient.get(`${isUserexist.email}`);
                emails_new_password.push(email);
                
                 // send email to the user with the link of the verification code
                const html = `<h4> Your email is authorized with the AKARA system , so please follow this link to set new password.</h4> 
                <a href="${url_randow()}">link to change for your new password</a>
                `;
                // send email to the user  
                Mailer(req.body.email,html);
                if(startClear==1){
                    setInterval(()=>{
                        emails_new_password=[];
                        startClear=0
                     },1000*60*60*24);
                }       
                return res.json({
                    error : false,
                    message : "You are sent an verification email to change your password"
                })
            }
               
        }else{
            // return back with the no response 
            return res.json({
                error : true,
                message : "there is no data"
            })
        }
    }
});
// ==============================================
// redirect link to verify password
// ==============================================

// ===============================================
// create new password
// ===============================================
optsender.post("/createnewpassowrd",async(req,res)=>{
    // verify the passowrd and confirm password submited
    if(req.body.new_password === req.body.confirm){
        // if all the password is matched 
        try{
            var get_email_cache = await redisClient.get(tmp_email);
            if (get_email_cache == null)  return res.json({
                error : true,
                message : "Your email is expired now please wait until your next request time."
            })
            console.log(get_email_cache);
        }catch(e){
            return res.json({
                error : true,
                message : e.message
            })
        }
        
        if(get_email_cache){
            const converted_email = await JSON.parse(get_email_cache);
            // find the email in the database 
            const email_ex = await signupModel.findOne({email : converted_email});
            if(email_ex){
                // before set the new password to the database
                const salt = await bcryptGenerator.genSalt(7);
                const newPassword = await bcryptGenerator.hash(req.body.new_password,salt);
                // update that user with the new password 
                await signupModel.updateOne({email : email_ex._id},{
                    password : newPassword,
                    confirm  : newPassword
                });
                const html = `<h4> Your password has been just changed to the new one successfully </h4>
                `;
                // send email to the user  
                Mailer(tmp_email,html);
                return res.json({
                    error : false,
                    message : "You are completely changed your password successfully."
                })
            }else{
                return res.json({
                    error : true,
                    message : "Not allowed to verify because requested email is expired, or there is no that email"
                })
            }
        }else{
            return res.json({
                error : true,
                message : "Please request to server again becuase your verified time is expired"
            })
        }

    }else{
        return res.json({
            error : true,
            messsage : "Your password is not match"
        })
    }
});
//================================================
// DESKTOP LOGOUT 
//================================================
optsender.post("/desktop/logOut",desktopLogout,(req,res)=>{
    // generate new refresh token to the user
    const identify = "akara"+optGenerator(); 
    const refreshWithoutUser = generateToken({email: req.email,identify:identify},process.env.PROGRAM_REFRESH_TOKEN_SECRET,31104000000); // expire in 1 year after generated
    // after generate new token please response it the our user
    return res.json({
        error : false, 
        message : "You are logged out from system",
        refresh : refreshWithoutUser
    });

})
//===============================================
// DESKTOP/ SIGIN SECTION 
//===============================================
optsender.post("/signIn",async (req,res)=>{
    // taking and validating the user input password and akara secrete code access name 
    const {email,password}= req.body;
    const {error}=LoginValidation(req.body);
    // if there is something error with input 
    if(error)  res.json({error : true , message : error.message}) ;
    try {
        // veriy with database 
        const data = await signupModel.findOne({ email : email});
        if(data.email == email){
            // compare password 
            const isMatch = await bcryptGenerator.compare(password, data.password);
            if(isMatch){
                // check if the user has already register with unexpired refresh token or their refresh token exists in db
                if(data.refreshToken != null){
                    // if user has registered
                    return res.json({
                        error : false,
                        message : "You are logged",
                        refresh : data.refreshToken
                    })
                }else{
                    const user = "signed";
                    const scope = "desktop";
                    const identify = "akara"+optGenerator(); 
                    const refresh = generateToken({email, user ,password,role:user.role,scope,identify:identify},process.env.PROGRAM_REFRESH_TOKEN_SECRET,31104000000); // expire in 1 year after generated
                    // update the user with including their token
                    await signupModel.updateOne({email: email},{refreshToken : refresh});
                    const html = `<h4> You are logged into system. </h4>`;
                    Mailer(req.body.email,html,opt);
                    await redisClient2.flushAll();
                    // send the message to the user 
                    return res.json({
                        error : false,
                        message : "You are logged",
                        refresh
                    })
                }
               
            }else{
                return res.json({
                    error : true,
                    message : "You password not matched."
                })
            }
                          
            // pass the user data to token generator 
        }else{
            return  res.json({
                error : true,
                message : "You are not loged."
            })
        }
          } catch (error) {
                return res.json({
                    error : true,
                    message : error.message
              })
         }
})
//==================================================
// DESKTOP / SIGNUP SECTION
//==================================================

optsender.post("/signUp",async (req,res)=>{
    // pass all the data from the body to validate the fields
    try{
        // to get error while validation , return for Joi library will return error and value object back
        const {error} = SignUpValidation(req.body);
        if(error){
            res.json({
                error : true,
                message : "You input field is incorrect , check : "+error.message
            })
        }else {
        
            if(req.body.password != req.body.confirm){
                res.json({
                    error : true,
                    message : "Your input password is not matched , check it again"
                })
            }else{
                    // before let the user to register their usernaem check whether they are already registered before
                    const user = await signupModel.findOne({'email':req.body.email});
                    if(user){
                        if(user.username == req.body.username   ){
                            if(user.email == req.body.email){
                                res.json({
                                    error : true,
                                    message : " You are already registered "
                                })
                            }
                           
                        }             
                    }else{   
                                    // take the input password and generate it into hash
                                    const salt = await bcryptGenerator.genSalt(7);
                                    const hassPassword = await bcryptGenerator.hash(req.body.password,salt);
                                    // insert the data to the mogo database 
                                    try{
                                        // insert data into database
                                        req.body.password = hassPassword;
                                        req.body.confirm = hassPassword;
                                        data_for_user = req.body;
                                        opt = optGenerator();
                                        const html = `<h4> Your verify code<span style:"color : red;"> ${opt} </span>keep as a secret</h4>
                                                    <span > Thanks you for joining us .
                                        `;
                                        Mailer(req.body.email,html);
                                        redisClient.setEx("opt_code",300,opt).then(()=> console.log("redis inserted")).catch(e => console.log(e));
                                        redisClient.setEx("email_tmp",300,req.body.email).then(()=> console.log("redis inserted")).catch(e => console.log(e));
                                        res.status(200).json({
                                            error : false,
                                            message : "You have 2 minutes to verify your code"
                                        }) ;    
                                    }catch(error){
                                        console.log("error during insert info to database");
                                    }
                                                    
                }
            }
        }
            
    }catch(error){
       // show internal server error
        res.status(500).json({
            error : true,
            message : "internal server is being crashed..., required to be fixed urgently"
        })
    }
})
//=========================================================================
//  OTP CODE VERIFY SECTION
//=========================================================================
let request = 0;
optsender.post('/opt/verify',async(req,res)=>{
        // get client code 
        const opt_code_verify = req.body.code;
        if(opt_code_verify == null || opt_code_verify === ""){
            res.json({
                error : true,
                message : "You haven't give the opt code verification yet"
            })
        }else{
            // if has code OPT
            const code_tmp = await redisClient.get("opt_code");
            console.log("===",code_tmp);
            if(opt_code_verify == code_tmp){
                // send respnse to the user they are fully register
                try{
                    const insertData = new signupModel(data_for_user);
                    await insertData.save();
                    const html = `<h4> <span style:"color : red;"> You are completely logined </span></h4>
                                                        <span > Thanks you for joining us .
                    `;
                    Mailer(data_for_user.email,html); 
                    request=0;
                    res.json({
                        error : false ,
                        message : "you are completed regiseter"
                    })
                }catch(e){
                    return res.json({
                        error : true,
                        message : e.message
                    })
                }
              
            }else{
                res.json({
                    error : true ,
                    message : "you have to re-request to get the verify code ."
                })
            }
        }
})
//=========================================================================
//  OTP CODE REVERIFY SECTION
//=========================================================================

optsender.get("/opt/reverify",async(req,res)=>{
    opt = optGenerator();
    if(request == 0){
        redisClient.setEx("opt_code",300,opt).then(()=> console.log("redis inserted")).catch(e => console.log(e));
        const email_tmp = await redisClient.get("email_tmp");
        if(email_tmp !=null){
            Mailer(email_tmp,opt)
        }else{
            return res.json({
                error : true,
                message : "PLease sign up again."
            })
        }
        request++;
        console.log("re_verify",opt); 
        return res.json({
            error : false,
            message : "code is being sent to your email account , please go to check it out"
        })
    }else{
        return res.json({
            error : true,
            message : "wait 5 minutes because you have jsut request to verify."
        })
    }
   
    
})
//=========================================================================
//  SYSTEM API CREDENTIAL SECTION
//=========================================================================
optsender.post("/akara/credential",async(req,res)=>{
    // generate the client id to the trusted user
    const salt = await bcryptGenerator.genSalt(7);
    const hassClientId = await bcryptGenerator.hash("akaratrustedclientId",salt);
    const hassClientSecret = await bcryptGenerator.hash("akaratrustedclientsecret",salt);
    // insert data token model 
    const insertToken = new tokenModel({
        clientId : hassClientId,
        clientSecret : hassClientSecret
    });
    // save data to database 
    await insertToken.save();
    res.status(200).json({
        error : false ,
        message : "You are send the credential ",
        data : {
            clientId : hassClientId,
            clientSecret : hassClientSecret
        }
    })
})
// =======================================================================
//  ACCESS TOKEN FOR DESKTOP 
//=========================================================================
optsender.post('/akara/desktop/access/token',refreshMiddleware,(req,res)=>{
    // generate access token for client with valid expiration
    const accessToken = generateToken({grantType: req.grantType,user : req.user,email: req.email , role:req.role ,scope:req.scope,identify:req.identify },process.env.PROGRAM_TOKEN_SECRET,'1h'); // expire in 1h after generated
    // take the the clientId of the refresh token and check the user if they are signed user or none 
    return res.json({
        error : false,
        message : "Your request to obtain access token is completed",
        accessToken
    })
    
})
// ========================================================================
// ACCESS TOKEN FOR WEB 
//========================================================================
optsender.post('/akara/web/access/token',refreshMiddleware,(req,res)=>{
    // generate access token for client with valid expiration
    const accessToken = generateToken({user : "none",email : req.email,grantType : req.grantType,identify:req.identify},process.env.PROGRAM_TOKEN_SECRET,'1h'); // expire in 1h after generated
    // take the the clientId of the refresh token and check the user if they are signed user or none 
    return res.json({
        error : false,
        message : "Your request to obtain access token is completed",
        accessToken
    })
    
})
//===================================================
// SYSTEM TOKENS |  REFRESH TOKEN PROVIDER DESKTOP EVERY REQEST 
//===================================================
optsender.post("/akara/every/request/refreshtoken",async(req,res)=>{
    const email = req.body.email;
    if(email){
        // use that email to search from database
        const email_exist = await signupModel.findOne({
            email : email
        });
        if(email_exist){
            // if exist that token , generate the refresh token to that user
            const identify = "akara"+optGenerator(); 
            const user = "signed";
            const scope = "desktop"
            const refresh =  generateToken({user : user,email : email_exist.email,role: email_exist.role,scope : scope,identify:identify},process.env.PROGRAM_REFRESH_TOKEN_SECRET,'2h'); // expire in 2h after generated
            return res.json({
                error : false,
                message : "Your token is valid for 2 hours",
                refreshToken : refresh
            })
        }else{
            return res.json({
                error : true,
                message : "No this email to be availably provided the token to, sorry"
            })
        }
    }else{
        return res.json({
            error : true,
            message : "No email provide."
        })
    }
})
//===================================================
// SYSTEM TOKENS | ACCESS AND REFRESH TOKEN PROVIDER for web and desk
//===================================================
optsender.post("/akara/token/refresh", async (req,res)=>{
    const {grantType,clientId,clientSecret,scope} = req.body;
    const user = "none";
    const identify = "akara"+optGenerator(); 
    // validate fields
    const {error}=RequestTokenValidation({grantType,clientId,clientSecret,scope});
    if(error){
        res.json({
            error : true ,
            message : error.message
        })
    }else{
        if(grantType == "credential"){
            if(scope == "desktop" || scope == "web" || scope == "mobile"){
                try {
                    // check whether the clientId is already created 
                    const clientIdFound = await tokenModel.findOne({clientId : clientId});
                    if(clientIdFound != null){
                         // generate token to the user 1800000 31104000000
                         const refreshToken = generateToken({grantType,user: "none",email : "none",clientId,clientSecret,scope,role:"user",identify:identify},process.env.PROGRAM_REFRESH_TOKEN_SECRET,'1y'); // expire in 1 year after generated
                            // update the request's token
                            await tokenModel.updateOne({clientId : clientId},
                                {
                                    user , 
                                    grantType ,
                                    refreshToken,
                                    scope,
                                    refreshExp : "1y"
    
                                });
                                 // insert to database 
                                res.status(200).json({
                                    error : false,
                                    message : "You have requested successfully",
                                    refreshToken
                                })
                    }else{
                        res.json({
                            error : true,
                            message : "Your clientId and clientSecret is not validated or existed."
                        })
                    }
                   
               } catch (error) {
                   if(error) res.status(400).json({
                       error : true,
                       message : "You have some problem with data form submission missing attribute, contact to the owner. ",
                       problem : error.message
                   });
               }
               
            }else{
                res.json({
                    error : true,
                    message :"Your scope are not allowed"
                })
            }
        }else{
            res.json({
                error : true,
                message : "Your credential is not correct."
            })
        }
    }

  
})

// =======================================
// AUTHENTICATION SERVER 
//========================================
optsender.listen(PORT,function(){
    console.log(`AKARA AUTHENTICATION SERVER IS BEING LISTENNED ON PORT : ${PORT}`);
});

//                   //======================================\\
//                   ||       END OF AUTHENCATION  SERVER     ||
//                   \\======================================//
module.exports = {
    redisClient
}