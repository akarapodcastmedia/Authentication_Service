const {signupModel} = require('../db/shcema');
const jwt = require("jsonwebtoken");
// define logout middleware 
const desktopLogout = async (req,res,next) =>{
    const token = req.header("Authorization");
    if(token){
        // if has authorized header is send 
        try{
            const  refreshToken = token.split(" ")[1];
            jwt.verify(refreshToken,PROGRAM_REFRESH_TOKEN_SECRET,(error,user)=>{
                // if existence of error happen
                if(error){
                    return res.json({
                        error : true,
                        message : error.message
                    })
                }else{
                    req.user = "none";
                    req.email = user.email;
                    req.password = user.password;
                    next();
                }
            })
        }catch(e){
            return res.json({
                error : true,
                message : e.message
            })
        }
       
    }else{
        return res.json({
            error : true,
            message : "You are reqired to input token "
        })
    }
    // check if the header authorized token is send along the request
    jwt.verify()
};

module.exports =  {
    desktopLogout
}
