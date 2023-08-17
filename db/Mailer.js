// import module
const {mailQueueSender} = require('./QueueEmail');
const { Mainserver} = require('./Mailserver');
const { bulltask } = require('./bulltask');
const Mailer =  (email,html) =>{
    // implement email queue sender
    try{
        mailQueueSender(Mainserver(email,html)).then(()=> console.log("New sender is send success")).catch((e)=> console.log(e));
     }catch(error){
        console.log("queue eroor");
     }
}

module.exports = {Mailer};