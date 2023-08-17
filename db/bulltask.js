const Queue = require('bull');
// create mail queue
const tasker = async (task) => {
    const mailQueue = new Queue('mailQueue','redis://akara.cache.bunchhay.me:6379');
    await mailQueue.add(task);
    // process the queue
    await mailQueue.process(async(job,done)=>{
        console.log(job.id);
        console.log(job.isActive);
        console.log(job.isCompleted);
   })
}
const  input =  async (task) => {
     tasker(task).then(res => console.log("success")).catch(e=> console.log(e));
}

// module.export 
module.exports={
    input
}