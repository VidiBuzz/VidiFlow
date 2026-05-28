const amqp = require('amqplib');

// Connect to RabbitMQ
async function connectToRabbitMQ() {
  const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_USER || 'vidicrm'}:${process.env.RABBITMQ_PASS || 'vidicrm_secret'}@rabbitmq:5672`);
  console.log('Connected to RabbitMQ');
  
  // Create a queue for processing jobs
  const queue = 'job_queue';
  await connection.createQueue(queue, { durable: true });
  console.log(`Queue '${queue}' created`);
  
  // Consume messages from the queue
  const channel = connection.createChannel();
  
  channel.consume(queue, async (msg) => {
    if (!msg) return;
    
    const job = JSON.parse(msg.content.toString());
    console.log(`Processing job: ${job.type} - ${job.id}`);
    
    try {
      // Process the job based on type
      if (job.type === 'email') {
        await processEmailJob(job);
      } else if (job.type === 'index') {
        await processIndexingJob(job);
      }
      
      // Acknowledge message after successful processing
      channel.ack(msg);
      console.log(`Job completed: ${job.id}`);
    } catch (error) {
      console.error(`Job failed: ${error.message}`);
      // NACK with requeue for failed jobs
      channel.nack(msg, false, true);
    }
  }, { noAck: false });
  
  return connection;
}

// Process email sending job
async function processEmailJob(job) {
  console.log(`Sending email to ${job.email}`);
  
  // TODO: Implement email sending logic using Resend API
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ from: job.from, to: job.email, subject: job.subject, html: job.html })
  // });
  
  console.log(`Email sent successfully to ${job.email}`);
}

// Process indexing job (Vespa)
async function processIndexingJob(job) {
  console.log(`Indexing document: ${job.documentId}`);
  
  // TODO: Implement Vespa indexing logic
  // const response = await fetch(`${process.env.VESPA_URL}/search`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ query: job.query })
  // });
  
  console.log(`Document indexed: ${job.documentId}`);
}

// Start worker
(async () => {
  try {
    const connection = await connectToRabbitMQ();
    console.log('Worker started and listening for jobs');
    
    // Keep the process alive
    setInterval(() => {}, 10000);
  } catch (error) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
})();
