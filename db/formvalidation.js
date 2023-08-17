const Joi = require('joi');
const passComplexity = require('joi-password-complexity');

// validation signup fields 
const SignUpValidation = (body) => {
    const schema = Joi.object().keys({
        username : Joi.string().required(),
        email    : Joi.string().email().required().label("email"),
        password : passComplexity().required().label("password"),
        confirm  : passComplexity().required().label("confirmpassword"),
        role    : Joi.string().label("roles"),
        personal_secret : Joi.string().label("personalSecret") 
    })
    return schema.validate(body);
}

const LoginValidation = (body) => {
    // to validate each required fields 
    const schema = Joi.object({
        email : Joi.string().email().required().label("emailLogin"),
        password : passComplexity().required().label("passwordSignUp"),
        role : Joi.string().label("role"),
        personal_secret: Joi.string().label("personal_secret")
    })
    // return schema of Loginvalidation
    return schema.validate(body);
}
// forget password validation email 
const ForgePassValidation=(body) => {
    // define the validate schema for foreget password section
    const schema = Joi.object({
        email : Joi.string().email().required().label("forget password email verify")
    });
    //return the validated schema 
    return schema.validate(body);
}

const RequestTokenValidation = (body) =>{
    const schema = Joi.object().keys({
        grantType : Joi.string().required().label("grantType"),
        clientId : Joi.string().required().label("client id "),
        clientSecret : Joi.string().required().label("client secret"),
        scope : Joi.string().required().label("scope")
    })
    // return schema of RequestTokenValidation
    return schema.validate(body);
}
// return all the required methods to the external use
module.exports = {
    SignUpValidation,
    LoginValidation,
    RequestTokenValidation,
    ForgePassValidation
}