
const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ifklbg0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const productsCollection = client.db('shopEase').collection('products')
    // count the all products
    app.get('/productCount', async (req, res) => {
      const result = await productsCollection.estimatedDocumentCount()
      res.send({ count: result })
    })
    // pagination with sorting
    app.get('/products', async (req, res) => {
      // set the page and size
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      // set how to sort low to high or high to low
      const sortField = req.query.sortField || 'price';
      // set how to sort new or old
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      const result = await productsCollection.find()
        .sort({ [sortField]: sortOrder })
        .skip(page * size)
        .limit(size)
        .toArray();

      return res.send(result);
    });

    // search products with pagination
    app.get('/search', async (req, res) => {
      const value = req.query.value;
      // set the page and size
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      // set how to sort low to high or high to low
      const sortField = req.query.sortField || 'price';
      // set how to sort new or old
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

      if (!value) {
        return res.status(400).send({ message: "Invalid search value" });
      }

      const regex = new RegExp(value, 'i');
      const searchResult = await productsCollection.find({ productName: { $regex: regex } })
        .sort({ [sortField]: sortOrder })
        .skip(page * size)
        .limit(size)
        .toArray();

      const totalResults = await productsCollection.countDocuments({ productName: { $regex: regex } });

      res.send({
        searchResult,
        totalResults,
      });
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  const result = "Hello from Shop Ease server";
  res.send(result)
})
app.listen(port, () => {
  console.log(`Shop Ease server is running on port: ${port}`);
})