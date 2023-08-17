const redis = require("redis");
const redisClient = redis.createClient({
    url : 'redis://cache.akarahub.tech:6379'
});
 (async()=> await redisClient.connect())();
redisClient.on('ready',()=> console.log("connect to redis success"));
redisClient.on('error',(err)=>console.log("error during connecting to redis server ..."));
const {optGenerator} = require("../otpgenerator");
let random_path=null;
const url_randow = ()=>{
    // define the randomlink 
    random_path = `${optGenerator()}`;
    const path = `/forget/newpassword/${random_path}`;
    const full_url = `http://localhost:5000${path}`;
    console.log("LINK : ",full_url);
    // set the random path in the rediscache for 15 minutes
    redisClient.setEx("tmp_link",(60*15),path);
    return full_url;
}

module.exports = {
    url_randow,
    random_path
}