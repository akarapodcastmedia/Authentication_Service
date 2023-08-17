const Queue = require('bee-queue-scheduler');
//configure Queue with redis
let in_task = null;
const options = {
    removeOnSuccess: true,
    redis: {
        host: "akara.cache.bunchhay.me",
        port: 6379,
    },
}
// create a metho to let the client give the queue job
const mailsheduler = new Queue('mailer', options);
const schedulterMail = async (task)=>{
    in_task = task;
    const job=  mailsheduler.createJob(task); // assign job to the queue
    return job.schedule('*/10 * * * * *', 'Asia/Phnom_Penh');
}
//  cookQueue process 
mailsheduler.process(3,(job,done)=>{
    // state th statement to the console
    setTimeout(() => console.log("Mail is preparing to send to our user 🥬 🧄 🧅 🍄"), 1000);
    setTimeout(() => {
        console.log("Mail is sent completely.");
    }, 2*1000);
    // after 5 millisection you will get the email 
    return mailsheduler.createJob(in_task).save();
    // setTimeout(() => {
    //     console.log("Mail is sent completely.");
    // }, 2*1000);
});
// when the mail is sent successfully
mailsheduler.on('succeeded', (job, result) => {
    // send the message when the email is sent completely
    console.log("==================<< success of mail sending >>=======================");
    console.log(job.data);
});

module.exports= {
    schedulterMail
}