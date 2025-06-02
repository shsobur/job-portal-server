const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 8000;
const { MongoClient, ServerApiVersion } = require("mongodb");

// MongoDB net URL__
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g4yea9q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors());
app.use(express.json());

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

    // DB work ST__

    // DB all collections__
    const jobsCollections = client.db("jobPortal").collection("jobs");
    const usersCollections = client.db("jobPortal").collection("users");

    // Post use data__
    app.post("/user-role-data", async (req, res) => {
      try {
        const user = req.body;
        const isExist = await usersCollections.findOne({
          userEmail: req.body.userEmail,
        });

        if (isExist) {
          return res.status(200).json({ message: "User already exists" });
        }

        const result = await usersCollections.insertOne(user);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error inserting user role data:", error);
        res.status(500).send({ error: "Failed to insert user role data" });
      }
    });

    // Get use data__
    app.get("/current-user-data/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { userEmail: email };
        const result = await usersCollections.findOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Post job circular__
    app.post("/add-job-circular", async (req, res) => {
      try {
        const jobData = req.body;
        const result = await jobsCollections.insertOne(jobData);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error inserting job circular:", error);
        res.status(500).send({ error: "Failed to insert job circular" });
      }
    });

    // DB work END__

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  const result = "Job Portal server is running";
  res.send(result);
});

app.listen(port, () => {
  console.log(`Server is running... on ${port} PORT`);
});
