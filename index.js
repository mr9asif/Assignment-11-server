const express = require('express');
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 4000;

const app = express();

// middle ware
app.use(cors({
    origin: ['http://localhost:5173', ''], 
    credentials: true 
  }));
app.use(express.json());



// modngo start--
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p7hqbnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });


  async function run() {
    try {
    //    Collection
      const BlogsCollection = client.db('BlogsDB').collection('Blogs');
//  post-----
      app.post('/addblogs', async(req,res)=>{
         const query= req.body;
         const result = await BlogsCollection.insertOne(query);
         console.log(result)
         res.send(result)
      })
            
    //   get-----
     app.get('/allblogs', async(req, res)=>{
         const result = await BlogsCollection.find().toArray();
         console.log(result)
         res.send(result)
     })

      // Send a ping to confirm a successful connection
    //   await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    
    }
  }
  run().catch(console.dir);



app.get('/', (req,res)=>{
    console.log('server is running..')
})



app.listen(port, ()=>{
    console.log(`server is running on ${port}`)
})

