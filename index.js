const express = require('express');
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
      const CommentCollection = client.db('BlogsDB').collection('Comments')
//  post-----
      app.post('/addblogs', async(req,res)=>{
         const query= req.body;
         const result = await BlogsCollection.insertOne(query);
         console.log(result)
         res.send(result)
      })
      app.post('/addcomments', async(req,res)=>{
         const query= req.body;
         const result = await CommentCollection.insertOne(query);
         console.log(result)
         res.send(result)
      })

      // put
     
      app.put('/update/:id', async(req,res)=>{
         console.log(req.params.id)
         const id= req.params.id;
         const query = {_id: new ObjectId(id)}
         const updateBlogs={

           $set:{
            imageUrl:req.body.imageUrl,
         
            title:req.body.title,
            catagory:req.body.catagory,
            shortDiscription:req.body.shortDiscription,
            lognDescription:req.body.lognDescription,
            profile:req.body.profile,
            
            
           }
           
         }
         const result = await BlogsCollection.updateOne( query,updateBlogs)
         res.send(result)
         console.log(result)
      })
            
    //   get-----
     app.get('/allblogs', async(req, res)=>{
         const result = await BlogsCollection.find().toArray();
        
         res.send(result)
     })
     
     app.get('/allcomments', async(req, res)=>{
         const result = await CommentCollection.find().toArray();
        
         res.send(result)
     })

     app.get('/viewdetails/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        
         const result = await BlogsCollection.findOne(query);
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

