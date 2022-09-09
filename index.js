const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nekxbte.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
    try {
        await client.connect();
        const userCollection = client.db('user').collection('users');
        const receiptCollection = client.db('receipts').collection('receipt');


             // AUTH
             app.post('/login', async (req, res) => {
              const user = req.body;
              const accessToken = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
                  expiresIn: '1h'
              });
              res.send({ accessToken });

          })





        //get all firms list on select
        app.get('/firm', verifyJWT, async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const firms = await cursor.toArray();
            res.send(firms);


        });

        //get all receipt
        app.get('/receipt', verifyJWT, async (req, res) => {
            // const tokenInfo = req.headers.authorization;
            // const [email, accessToken] = tokenInfo?.split(" ");
            // const decoded = verifyToken(accessToken)
            // if (email === decoded.email) {
            const query = {};
            const cursor = receiptCollection.find(query);
            const receipt = await cursor.toArray();
            res.send(receipt);
            // }

            // else {
            //   res.send({ success: 'unauthorize' })
            // }

        });


        //delete single receipt
        app.delete("/receipt/:id", verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await receiptCollection.deleteOne(query);
            res.send(result);
        });

        //delete firm
        app.delete("/firms/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // app.post('/login', (req, res) => {
        //   const email = req.body;
        //   const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
        //   res.send({ token })
        // })

        app.put("/flat/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const doc = {
                $set: req.body,
            };
            const tools = await flatCollection.updateOne(query, doc, options);
            res.send(tools);
            console.log(doc);
        });

        app.put("/flat/makeGB/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { gb_status: "Paid" },
            };
            const result = await flatCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        app.put("/flat/makeSC/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { sc_status: "Paid" },
            };
            const result = await flatCollection.updateOne(filter, updateDoc);
            res.send(result);
        });



        //get some by total daily on homepage


        app.get("/home", async (req, res) => {
            const date = req.query.date;
            const query = { date: date };
            const reports = await receiptCollection.find(query).toArray();
            res.send(reports);
        });


        app.put('/receiptPaid/:id', async (req, res) => {
            // res.send("Working")
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const doc = {
                $set: req.body
            }
            const result = await receiptCollection.updateOne(query, doc, options);
            res.send(result);
        });


        app.put('/receipt/:id', async (req, res) => {
            // res.send("Working")
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const doc = {
                $set: req.body
            }
            const result = await receiptCollection.updateOne(query, doc, options);
            res.send(result);
        });
        //get some by total daily on homepage


        app.get("/reports/daily", verifyJWT, async (req, res) => {
            const date = req.query.date;
            const query = { date: date };
            const reports = await receiptCollection.find(query).toArray();
            res.send(reports);
        });
        //get some by total yearly on homepage


        app.get("/reports/yearly", verifyJWT, async (req, res) => {
            const year = req.query.year;
            const query = { year: year };
            const reports = await receiptCollection.find(query).toArray();
            res.send(reports);
        });


        //get some by total monthly on homepage


        app.get("/homes", verifyJWT, async (req, res) => {
            const month = req.query.month;
            const query = { month: month };
            const reports = await receiptCollection.find(query).toArray();
            res.send(reports);
        });


        //get some by month


        app.get("/reports", verifyJWT, async (req, res) => {
            const month = req.query.month;
            const query = { month: month };
            const reports = await receiptCollection.find(query).toArray();
            res.send(reports);
        });
        //get some by firmname


        app.get("/reports/firm", async (req, res) => {
            const firmName = req.query.firmName;
            const query = { firmName: firmName };
            const reports = await receiptCollection.find(query).toArray();
            res.send(reports);
        });


        //get firm by select
        app.get("/firms/firm", async (req, res) => {
            const firmName = req.query.firmName;
            const query = { firmName: firmName };
            const firms = await userCollection.find(query).toArray();
            res.send(firms);
        });
        //add member
        app.post("/addMember", async (req, res) => {
            const newMember = req.body;
            const tokenInfo = req.headers.authorization;
            const [email, accessToken] = tokenInfo?.split(" ");
            const decoded = verifyToken(accessToken)
            if (email === decoded.email) {
            const result = await userCollection.insertOne(newMember);
            res.send(result);
            }

            else {
              res.send({ success: 'unauthorize' })
            }
        });
        //add receipt
        app.post("/receipt", async (req, res) => {
            const newOrder = req.body;

            const result = await receiptCollection.insertOne(newOrder);
            res.send(result);

        });


        //get single  details
        app.get("/receipt/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tools = await receiptCollection.findOne(query);
            res.send(tools);
        });

        //get single firm details
        app.get("/firm/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tools = await userCollection.findOne(query);
            res.send(tools);
        });


        app.put('/firm/:id', async (req, res) => {
            // res.send("Working")
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const doc = {
                $set: req.body
            }
            const result = await userCollection.updateOne(query, doc, options);
            res.send(result);
        });
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Meal_Man Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})

// function verifyToken(token) {
//   let email =
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//       if (err) {
//         email = 'invalid email'
//       }
//       if (decoded) {
//         email = decoded
//       }

//     })
//   return email;
// }