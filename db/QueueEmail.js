//const Queue = require('bee-queue');
const Queue = require('bull');
const mailQueueSender = async (task) => {
    const mailQueue = new Queue('mailQueue','redis://akara.cache.bunchhay.me:6379');
    await mailQueue.add(task);
    // process the queue
    await mailQueue.process(async(job,done)=>{
        console.log(job.id);
        console.log(job.isActive);
        console.log(job.isCompleted);
        done();
   })
}
module.exports = {mailQueueSender};