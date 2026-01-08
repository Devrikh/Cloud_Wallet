const express = require("express");
const { userModel } = require("./models");
const { Keypair, PublicKey, Transaction, Connection } = require("@solana/web3.js");
const jwt = require("jsonwebtoken");
const bs58= require("bs58")
const cors= require("cors");


const app = express();
require("dotenv").config();
app.use(cors())
app.use(express.json());




const connection=new Connection("https://api.devnet.solana.com");


app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;

  // validate inputs, check if the user exists, hash password

  const keypair = new Keypair();

  await userModel.create({
    username,
    password,
    publicKey: keypair.publicKey.toString(),
    privateKey: keypair.secretKey.toString(),
  });

  res.json({
    publicKey: keypair.publicKey.toString(),
  });
});

app.post("/api/v1/signin",  async(req, res) => {
  const { username, password } = req.body;

     const user= await userModel.findOne({
    username,
    password
  });

  if(user){

    const token=jwt.sign({
        id: user._id
    },process.env.JWT_SECRET)
    
  res.json({
    token: token,
  });

  }else{
    res.status(403).json({
    message: "Bad Credentials",
  });
  }

});

app.post("/api/v1/txn/sign",async (req, res) => {
  const serialisedTx= req.body.message
   const payload=jwt.decode(req.headers.token, process.env.JWT_SECRET);

  const tx= Transaction.from(Buffer.from(serialisedTx));
 
  
  const user=await userModel.findOne({
      _id:payload.id
  })

  
  const keyPair= Keypair.fromSecretKey(bs58.default.decode(user.privateKey))
  // const keyPair= Keypair.fromSecretKey(bs58.default.decode())
  const {blockhash}= await connection.getLatestBlockhash();
    tx.recentBlockhash=blockhash;
    tx.feePayer=keyPair.publicKey;

  tx.sign(keyPair)

  const signature= await connection.sendTransaction(tx, [keyPair]);
  console.log(signature);

  res.json({
    message: signature,
  });
});

app.get("/api/v1/txn/id", (req, res) => {
  res.json({
    message: "txn status",
  });
});

app.listen(3000);
