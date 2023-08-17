const redis = require("redis");
const redisClient = redis.createClient({
    url : 'redis://cache.akarahub.tech:6379'
});
 (async()=> await redisClient.connect())();
redisClient.on('ready',()=> console.log("connect to redis success"));
redisClient.on('error',(err)=>console.log("error during connecting to redis server ..."));
const redirectMiddleware = async (req,res,next)=>{
    // check the cache if the in comming path is not exp
    const get_random_url = await redisClient.get("tmp_link");
    console.log(get_random_url);
    // if the randomised path has not expired please let the user able to click and navigate to their rechange password eles block that user
    if(get_random_url){
        next();
    }else{
        return res.json({
            error : true,
            message : "The link is expired, No chance to be accessible"
        })
    }
}
module.exports = {
    redirectMiddleware
}