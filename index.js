const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()



const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rbwav.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {

        await client.connect();
        const database = client.db("clear_pixel");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("order1");
        const reviewCollection = database.collection("review");
        const userCollection = database.collection("user");
        const cartCollection = database.collection("cart");

        // GET API 
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // get cart products 
        app.get('/addToCart/cart/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = cartCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // app.get('/products/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await productCollection.findOne(query);
        //     res.send(result);
        // })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

        })



        app.get('/allOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //  search order by email
        app.get('/allOrders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // add orders from cart
        app.post('/cartToOrders', async (req, res) => {

            order = req.body
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // add to cart 
        app.post('/addToCart', async (req, res) => {
            const order = req.body;
            const result = await cartCollection.insertOne(order);
            res.json(result);
        })


        // POST API 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        });

        // POST API 
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        });


        app.post('/addProduct', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.json(result);

        })

        // put api:  update 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true }
            updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, option);
            res.json(result)
        });

        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc);

            res.json(result)
        });


        app.put('/updateStatus/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body;

            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    orderStatus: status.status
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        })

        // DELETE API 
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })
        // delete from cart 
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.json(result);
        })

        // clear cart by email
        app.delete('/cartRemove/:email', async (req, res) => {
            const email = req.params.email;
            console.log(req.params.email);
            const query = { email: email };
            const result = await cartCollection.deleteMany(query);
            console.log(result);
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})