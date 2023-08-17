require("dotenv").config();
const jwt = require("jsonwebtoken");

// create a function functions to generate the token for the system

function generateToken(generated_data,secret,time_exp){
    // using sign function to generate token from jwt
    const token = jwt.sign(generated_data,secret,{ expiresIn: time_exp});
    // return the token to the user 
    return token;
}

function CheckTokenValidation(req,res,next){
    // check the token from the user header 
    const token = req.header('Authorization').split(" ")[1];
    if(token==""){
        res.send("Forbiden request owing to no token provided.");
    }else{
        // code to verify the token from the use r
         jwt.verify(token,process.env.PROGRAM_TOKEN_SECRET,(user)=>{
            // the next request just only pass the user to the next process entry point
            next(user);
        });
    }
    
        
}

module.exports ={generateToken,CheckTokenValidation};

