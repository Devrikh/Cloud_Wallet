import './App.css'
import {Transaction,SystemProgram, PublicKey, LAMPORTS_PER_SOL, Connection} from "@solana/web3.js"
import axios from "axios"

const fromPubKey= new PublicKey("6ayDk6MGzSXT3AfD7NyEfmuM9rebWVs8L2pLAVKmgHqP");

const connection= new Connection("https://api.devnet.solana.com")



function App() {

  async function sendSol(){

    const ix= SystemProgram.transfer({
      fromPubkey: fromPubKey ,
      toPubkey: new PublicKey("9k8Wek7nE7LsTZtkFX9uwTgdmndxEYpzWgCmBDXL5fXc"),
      lamports: 0.001 * LAMPORTS_PER_SOL
    })
    const tx= new Transaction().add(ix);

    const {blockhash}= await connection.getLatestBlockhash();
    tx.recentBlockhash=blockhash;
    tx.feePayer=fromPubKey;

    //comvert txn to bytes , BE doesnt know shit about class and structure of tx
    const serializedTx= tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    console.log(serializedTx)

    await axios.post("http://localhost:3000/api/v1/txn/sign",{
      message: serializedTx,
      retry: false
    })

  }

  return (
    <>
    <input type="text" placeholder='Amount' />
    <input type="text" placeholder='Address' />
    <button onClick={sendSol}>Transfer</button>
    </>
  )
}

export default App
