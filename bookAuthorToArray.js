const {MongoClient} = require('mongodb');


async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

    const uri = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.pagxe.mongodb.net/local_library?retryWrites=true&w=majority';

    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();



        library = client.db("local_library")
        books = await client.db("local_library").collection("books")



        console.log("Got books")

        books.updateMany(
            {  },
            [{ $set: { author:  ['$author'] } }]
          )




        console.log("DONE !!!")


    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

console.log('Change book.author into an array of object ids');

main().catch(console.error);