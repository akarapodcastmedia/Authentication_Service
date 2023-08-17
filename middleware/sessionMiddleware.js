
const {LoginValidation} = require('../db/formvalidation');
const {signupModel} = require('../db/shcema');
// web session middleware 
const sessionMiddleware = async (req,res,next) => {
    // get session object 
    const session = req.session;
    console.log(session);
    // check if the session has along the request or not expired
    if(session.email  && session.password){
        return res.json({
            error : false,
            message : "You have logged before."
        })
    }else{
        // take input fields from the user and validate them by Joi
        try{
            const {error} = LoginValidation(req.body);
            error ?  res.json({error : true, message : error.message}) : "";
            // when all input from the client is all passed 
            // check whether role or personal secret are input along the request
            if(req.body.role == "podcaster"){
                try{
                    if(req.body.personal_secret != null || req.body.personal_secret == ""){
                        return res.json({
                            error : true,
                            message : "You are not allowed to input any personal secret , because it is not required."
                        })
                    }
                }catch(e){
                    return res.json({
                        error : true,
                        message : e.message
                    })
                }
            }else if(req.body.role == "admin"){
                // check if user input personal secret
                if(req.body.personal_secret !=null){
                    // let it process in the below section
                }else{
                    return res.json({
                        error : true ,
                        message : "please input personal_secret field"
                    })
                }
            }else{
                if(req.body.role){
                    return res.json({
                        error : true,
                        message : "You don't have to put role field"
                    })
                }else if (req.body.personal_secret){
                    return res.json({
                        error : true,
                        message : "You don't need to input personal secret field"
                    })
                }
            }

        }catch(e){
            res.json({error : true, message : "there is something error with your input"})
        }  
        
        // check is there any error with validation
       
        // after suceeding of input validation go to verify dat input with dabase of previous register
        try{
            console.log(req.body.email);
            const user = await signupModel.findOne({email : req.body.email});
            req.password = user.password;
            // if there is that user 
            console.log(user);
            if(user){
                if(req.body.role == "admin"){
                    console.log("podcaser......");
                    if(user.personal_secret == req.body.personal_secret){
                        req.role=req.body.role
                        next();
                    }else{
                        return res.json({
                            error : true ,
                            message : "Your secret is invalid or incorrect"
                        })
                    }
                }else if(req.body.role == "podcaster"){
                    console.log("podcaser......");
                    if(req.body.role == user.role){
                        req.role= req.body.role;
                        next();
                    }else{
                        return res.json({
                            error : true ,
                            message : "Your role is invalid or incorrect"
                        })
                    }
                }else{
                    console.log("last......");
                    if(user.role != null){
                        return res.json({
                            error : true,
                            message :"are you podcaster , if you are , please use your role"
                        })
                    }else if(user.personal_secret != null){
                        return res.json({
                            error : true,
                            message :"Are you admin , if you are , please use your secret"
                        })
                    }else{
                        if(req.body.role != "podcaster" || req.body.role != "admin" ){
                            return res.json({
                                error : true,
                                message : "Your role is invalid"
                            })
                        }else{
                            req.role= "user";
                            next();
                        }
                       
                    }       
                }
            }else{
                return res.json({
                    error : true,
                    message :"You have not registered yet"
                })
            }
        }catch(e){
        
                return res.json({
                    error : true,
                    message : e.message
                }) 
        }          
    }
}
module.exports = {sessionMiddleware};