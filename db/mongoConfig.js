const mongoose = require("mongoose");
module.exports = () => {
    // connect to the mongod instance to start the mongodb database server
    const database = mongoose.connect(process.env.db_connection_string,{useNewUrlParser: true});
    // if get the result object from the connection 
    const isConnected = mongoose.connection;
    isConnected.on("error",()=> console.log("connection fail"));
    isConnected.once("open",()=>console.log("connection to database success"));
    // end of the configuration connection db
    return database;
}