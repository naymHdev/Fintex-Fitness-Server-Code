require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

//// Middle Ware \\\\\
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

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
    const trainersCollection = client.db("fitnexFitness").collection("trainers");
    const imagesCollection = client.db("fitnexFitness").collection("images");
    const classesCollection = client.db("fitnexFitness").collection("classes");
    const forumsCollection = client.db("fitnexFitness").collection("forums");

    // Forums Post && Gets
    app.get("/forums", async (req, res) => {
      const result = await forumsCollection.find().toArray();
      res.send(result);
    });
    //Trainer add classes
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.post("/classes", verifyToken, async (req, res) => {
      const info = req.body;
      const result = await classesCollection.insertOne(info);
      res.send(result);
    });

    /// Trainer Section
    app.post("/trainers", async (req, res) => {
      const items = req.body;
      const result = await trainersCollection.insertOne(items);
      // console.log(88, items, result);
      res.send(result);
    });

    app.get("/trainers", async (req, res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    });

    ////// User Data save DB
    app.patch("/user/:email", async (req, res) => {
      const menu = req.body;
      const id = req.params.email;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          displayName: menu.displayName,
          email: menu.email,
          photoURL: menu.photoURL,
        },
      };
      const result = await menuCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      // console.log('object___________>', user, "====Email", email);
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await usersCollection.findOne(query);
      // console.log("User found?----->", isExist);
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
      // console.log("----User Email", email);
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
    app.get("/newsletters", async (req, res) => {
      const result = await subscribersCollection.find().toArray();
      res.send(result);
    });

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
