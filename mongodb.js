// CRUD  Operation

const {MongoClient, ObjectID} = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const dbname        = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database', error)
    }

    const db = client.db(dbname)

    db.collection('users').deleteOne({
        age: 123
    }).then((output) => {
        console.log(output.deletedCount)
    }).catch((e) => {
        console.log(e)
    })
})
