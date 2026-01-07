const express = require("express");
const { userModel } = require("./models");
const { Keypair, PublicKey } = require("@solana/web3.js");
const jwt = require("jsonwebtoken");


const app = express();
require("dotenv").config();

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
    token: jwt,
  });

  }else{
    res.status(403).json({
    message: "Bad Credentials",
  });
  }

});

app.post("/api/v1/txn/sign", (req, res) => {
  res.json({
    message: "Signature",
  });
});

app.get("/api/v1/txn/?id=id", (req, res) => {
  res.json({
    message: "txn status",
  });
});

app.listen(3000);
