const { app } = require('@azure/functions');
const sql = require('mssql');

app.storageQueue('StorageQueueTrigger', {
    queueName: 'order-service',
    connection: 'StorageConnectionString',
    handler: (queueItem, context) => {

        // queueItem is the Order JSON object
        console.log('Storage queue function executed: ', queueItem);

        // Setup db connection
        const sqlConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            port: 1433,
            database: process.env.DB_DATABASE,
            authentication: {
                type: 'default'
            },
            options: {
                encrypt: true
            }
        }

        // Function to insert record
        async function insertRecord() {
            try {
                // Database connection (pooled connection, meaning you can pool multiple statements in a single connection instead of reconnecting each time)
                const pool = await sql.connect(sqlConfig);

                // Create a sql "request" object
                const request = pool.request();

                // Parameterize inputs
                request.input('FirstName', sql.VarChar(255), queueItem.FirstName);
                request.input('LastName', sql.VarChar(255), queueItem.LastName);

                // Insert record into table
                const insertRow = await request.query('INSERT INTO [dbo].[Test] (FirstName, LastName) VALUES (@FirstName, @LastName)');

                // Get primary key of the row just inserted
                const insertResult = await request.query('SELECT @@IDENTITY as InsertId');
                const primaryKey = insertResult.recordset[0].InsertId;

                // Log the rows affected
                console.log('Rows inserted: ' + insertRow.rowsAffected + ' Primary key: ' + primaryKey);

                pool.close();
            }
            catch (err) {
                console.log("Database error: ", err);
            }
        }

        // Execute DB insert function
        insertRecord();
    }
});
