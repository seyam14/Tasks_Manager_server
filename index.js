const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,  // Make sure to include this option if your frontend is sending credentials (like cookies)
}));
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.izczxgs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db('TasksMangaerDB').collection('user');
    const tasksCollection = client.db("TasksMangaerDB").collection("tasks");

    // user api
    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
      })

      app.post('/user', async (req, res) => {
        const user = req.body;
        console.log(user);
        // 
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }

        // 
        const result = await userCollection.insertOne(user);
        res.send(result);
    });
      
    //  cretae Tasks
    app.post('/Tasks', async (req, res) => {
      const FormData = req.body;
      console.log(FormData);
      const result = await tasksCollection.insertOne(FormData);
      res.send(result);
    });
    app.get('/Tasks', async(req, res) =>{
      const result = await tasksCollection.find().toArray();
      res.send(result);
  })

  app.patch('/Tasks/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        role: 'admin'
      }
    }
    const result = await tasksCollection.updateOne(filter, updatedDoc);
    res.send(result);
  })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`  server is running on port ${port}`);
})