
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


const corsOptions = {
  origin: ['http://localhost:5173', 'https://shop-ease0.web.app', 'https://shop-ease0.firebaseapp.com'],
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

    // handle filter 
    app.get('/products/filter', async (req, res) => {
      const { brandNames, categoryNames, lowPrice, highPrice, page = 0, size = 10 } = req.query;
      // set how to sort low to high or high to low
      const sortField = req.query.sortField || 'price';
      // set how to sort new or old
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      const matchStage = {};

      // add brand name filter
      if (brandNames) {
        const brandArray = brandNames.split(',').map(brand => brand.trim());
        matchStage.brandName = { $in: brandArray };
      }

      // category filter
      if (categoryNames) {
        const categoryArray = categoryNames.split(',').map(category => category.trim());
        matchStage.category = { $in: categoryArray };
      }

      // price range filter
      if (lowPrice || highPrice) {
        matchStage.price = {};
        if (lowPrice) {
          matchStage.price.$gte = parseInt(lowPrice, 10);
        }
        if (highPrice) {
          matchStage.price.$lte = parseInt(highPrice, 10);
        }
      }
      
      const products = await productsCollection.aggregate([
        // build the logic for filter
        { $match: matchStage },
        // sorting 
        { $sort: { [sortField]: sortOrder } }, 
        // pagination
        { $skip: parseInt(page) * parseInt(size) }, 
        { $limit: parseInt(size) },
      ]).toArray();

      res.send(products);
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