const { app, output } = require('@azure/functions');

// Create a 'queueOut' object - our connection/config to queue
const queueOutput = output.storageQueue({
    queueName: 'order-service',
    connection: 'StorageConnectionString'
});

app.http('httpTrigger', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [queueOutput],
    handler: async (request, context) => {

        // Get JSON from the http request
        const json = await request.json();
        
        // TODO: validate incoming data

        // Save order to storage queue
        context.extraOutputs.set(queueOutput, json);

        return { body: "Success - order submitted to queue." };
    }
});
