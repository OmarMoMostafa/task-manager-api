const { MongoClient, ObjectId } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "task-manager";

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const userCollection = db.collection("users");

  // the following code examples can be pasted here...
  try {
    const tasks = await userCollection.deleteMany({ age: 20 });
    console.log(tasks);
  } catch (error) {
    console.log(error);
  }

  return "done.";
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
// const { MongoClient } = require("mongodb");

// const connectionUrl = "mongodb://localhost:27017";
// const dbName = "task-manager";

// const mongoClient = new MongoClient(connectionUrl);

// async function run() {
//   try {
//     await mongoClient.connect();
//     const db = await mongoClient.db(dbName);
//     const insertedRes = await db.collection("tasks").insertMany([
//       {
//         title: "finish section 2",
//       },
//       {
//         title: "give a kiss to cupcake",
//       },
//     ]);
//     console.log(insertedRes.ops);
//     console.log("connected");
//   } catch (err) {
//     console.log(err);
//   }
// }
// run();

// const { MongoClient, ServerApiVersion } = require("mongodb");

// // Replace the placeholder with your Atlas connection string
// const uri = "mongodb://localhost:27017";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect the client to the server (optional starting in v4.7)
//     await client.connect();

//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
