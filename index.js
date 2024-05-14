const express = require('express');
require('dotenv').config()
const cors = require('cors');
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000;

const app = express();

// middle ware
app.use(cors({
    origin: ['http://localhost:5173', 'https://relaxed-strudel-f0e9a5.netlify.app'], 
    credentials: true 
  }));
app.use(express.json());
app.use(cookieParser())


// own middle ware
const logger = async(req, res, next)=>{
  console.log('called', req.host, req.originalUrl)
  next()
}

const VarifyToken = async(req, res, next)=>{
const token = req.cookies?.Token
console.log('tooken', token)
if(!token){
 return res.status(401).send({messege:'unauthorized'})
}
jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
  if(err){
    console.log(err)
    return res.status(401).send({messege:"forbidden"})
  }
  console.log('token info', decoded)
  req.user = decoded
  next()
})
}

// modngo start--
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p7hqbnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  const cookieOption = {
    httpOnly:true,
   secure:process.env.NODE_ENV === 'production' ? true : false,
   sameSite:process.env.NODE_ENV === "production"? "none" : "strict"
}

  async function run() {
    try {
    //    Collection
      const BlogsCollection = client.db('BlogsDB').collection('Blogs');
      const CommentCollection = client.db('BlogsDB').collection('Comments')
      const WishListCollection = client.db('BlogsDB').collection('wishLists')

    //  Auth reletad
    app.post('/jwt',  async(req, res)=>{
      const user = req.body;
        console.log('user', user)
        const token = jwt.sign(user,  process.env.ACCESS_TOKEN, {expiresIn: '365d'})

        res
        .cookie(' Token', token , cookieOption)
        .send({success: 'true'})
   })

     //  log out
     app.post('/logout', async(req, res)=>{
      
      res
      .clearCookie('Token', { expires:new Date(0), ...cookieOption})
      .send({success:true})
      
   })


//  post-----
      app.post('/addblogs',  async(req,res)=>{
         const query= req.body;
         const result = await BlogsCollection.insertOne(query);
         console.log(result)
         res.send(result)
      })

      app.post('/addwishlist',  async(req,res)=>{
         const query= req.body;
         console.log(query)
         const result = await WishListCollection.insertOne(query);
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

      // delete
      app.delete('/wish/:id', async(req, res)=>{
         const id = req.params.id;
          console.log(id)
         const query = {_id: new ObjectId(id)};
         console.log(query)
         const result = await WishListCollection.deleteOne(query);
         console.log(result)
         res.send(result)
      })
            
    //   get-----
     app.get('/allblogs', async(req, res)=>{
         const result = await BlogsCollection.find().toArray();
        //  const queryuser= req.query.email;
        //  console.log('user' , queryuser)
        //  if(req.user.email !== req.query.email){
        //    return res.status(401).send({messege:"not authorized"})
        //  }
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
       
       
         res.send(result)
     })

     app.get('/wishlistblogs/:email',VarifyToken, async(req,res)=>{
          const userEmail = req.params.email;
          const query = {email : userEmail};
          const result = await WishListCollection.find(query).toArray();
             const queryuser= req.user.email;
           console.log('user' , queryuser)
          //  if(req.user.email !== req.user.email){
          //   return res.status(401).send({messege:"not authorized"})
          // }
          res.send(result)

     })
     app.get('/wishlist/:email', async(req,res)=>{
          const userEmail = req.params.email;
          const query = {email : userEmail};
          const result = await WishListCollection.find(query).toArray();
          //    const queryuser= req.user.email;
          //  console.log('user' , queryuser)
          //  if(req.user.email !== req.user.email){
          //   return res.status(401).send({messege:"not authorized"})
          // }
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

