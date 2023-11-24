const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

//// Middle Ware \\\\\
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.USER_ID_DB}:${process.env.USER_KEY_DB}@firstpractice.poejscf.mongodb.net/?retryWrites=true&w=majority`;

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

    const featuredCollection = client.db("fitnexFitness").collection("featured");
    const testimonialsCollection = client.db("fitnexFitness").collection("testimonials");


    // Featured Section
    app.get('/featured', async (req, res) => {
      const result = await featuredCollection.find().toArray()
      res.send(result)
    })

    app.get('/testimonials', async (req, res) => {
      const result = await testimonialsCollection.find().toArray()
      res.send(result)
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


app.get("/", (req, res) => {
  res.send("Hello Fitnex-Fitness!");
});

app.listen(port, () => {
  console.log(`Fitness app Running own port ${port}`);
});
