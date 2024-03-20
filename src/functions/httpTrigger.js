// Include output for storage queue
const { app, output } = require('@azure/functions');

// Create a 'queueOut' object - our connection/config to queue
const queueOutput = output.storageQueue({
    queueName: 'order-service',
    connection: 'StorageConnectionString'
});

app.http('httpTrigger', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [queueOutput], // tell our function the output should be to use this remote queue
    handler: async (request, context) => {

        // Get JSON from the http request
        const json = await request.json();
        console.log("JSON: ", json);

        // TODO: validate incoming data

        // Save order to storage queue
        context.extraOutputs.set(queueOutput, json);

        // Always provide a response to a web request
        return { body: "Success - order submitted to queue." };
    }
});
