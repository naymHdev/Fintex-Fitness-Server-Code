const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

//// Middle Ware \\\\\
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.USER_ID_DB}:${process.env.USER_KEY_DB}@firstpractice.poejscf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const featuredCollection = client.db("fitnexFitness").collection("featured");
    const testimonialsCollection = client.db("fitnexFitness").collection("testimonials");
    const subscribersCollection = client.db("fitnexFitness").collection("subscribers");
    const usersCollection = client.db("fitnexFitness").collection("users");


      ////// User Data save DB
      app.put("/users/:email", async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        // console.log('object___________>', user, "====Email", email);
        const query = { email: email };
        const options = { upsert: true };
        const isExist = await usersCollection.findOne(query);
        console.log("User found?----->", isExist);
        if (isExist) return res.send(isExist);
        const result = await usersCollection.updateOne(
          query,
          {
            $set: { ...user, timestamp: Date.now() },
          },
          options
        );
        res.send(result);
      });
  
      // Get user role
      app.get("/user/:email", async (req, res) => {
        const email = req.params.email;
        const result = await usersCollection.findOne({ email });
        res.send(result);
      });
  
      // auth secure related api
      app.post("/jwt", async (req, res) => {
        const user = req.body;
        // console.log("I need a new jwt", user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "365d",
        });
        // console.log('=======TOKEN========',token);
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      });
  
      //JWT  Logout
      app.get("/logout", async (req, res) => {
        try {
          res
            .clearCookie("token", {
              maxAge: 0,
              secure: process.env.NODE_ENV === "production",
              sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            })
            .send({ success: true });
          // console.log("Logout successful");
        } catch (err) {
          res.status(500).send(err);
        }
      });

    // Newsletters Post any user
    app.post("/newsletters", async (req, res) => {
      const news = req.body;
      console.log(news);
      const result = await subscribersCollection.insertOne(news);
      res.send(result);
    });

    // Featured Section
    app.get("/featured", async (req, res) => {
      const result = await featuredCollection.find().toArray();
      res.send(result);
    });

    app.get("/testimonials", async (req, res) => {
      const result = await testimonialsCollection.find().toArray();
      res.send(result);
    });

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
