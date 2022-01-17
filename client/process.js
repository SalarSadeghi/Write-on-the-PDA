

import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import fs from 'mz/fs.js';
import path from 'path';
import * as borsh from 'borsh';






class Message {
  constructor(properties) {
    Object.keys(properties).forEach((key) => {
        this[key] = properties[key];
    });
  }
}
let SCHEMA = new Map([[Message,
  {
      kind: 'struct',
      fields: [
          ['text', 'string']]
  }]]);
let space = 24;




export async function createKeypairFromFile(
)  {
  let filePath = "your key file path";
  const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}


export async function call() {
  let connection = new Connection(clusterApiUrl());
  let payer = await createKeypairFromFile();
  let programId = new PublicKey("your program ID address");
  let caller_account = await PublicKey.createWithSeed(
    payer.publicKey,
    'hello',
    programId,
  );

  console.log("caller account",caller_account.toString());
  const caller_account_info = await connection.getAccountInfo(caller_account);
  if (caller_account_info===null){
    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        basePubkey:payer.publicKey,
        fromPubkey:payer.publicKey,
        newAccountPubkey:caller_account,
        lamports:1000,
        seed:'hello',
        space:1000,
        programId:programId,
      })
    );
    let sig = await sendAndConfirmTransaction(connection,transaction,[payer]);
    console.log("creating account... ",caller_account.toString()," signature:",sig);
  }


  const instruction = new TransactionInstruction({
    data: new Uint8Array([0]),
    programId:programId,
    keys:[
      {pubkey:caller_account,isSigner:false,isWritable:true},
      {pubkey:payer.publicKey,isSigner:true,isWritable:false},
    ],
  });
  const transaction = new Transaction().add(instruction);
  let sig = await sendAndConfirmTransaction(connection,transaction,[payer]);
  console.log("Requesting...",sig);
}

export async function send_message(){
  let connection = new Connection(clusterApiUrl());
  let pda_account = new PublicKey("your PDA address");
  let programId = new PublicKey("your program ID address");
  let payer = await createKeypairFromFile();
  let message = new Message({
    text : " my name is foo".toString(),
  });
  let data_to_send = borsh.serialize(SCHEMA,message);
  const instruction = new TransactionInstruction({
    data: new Uint8Array([1,...data_to_send]),
    programId:programId,
    keys:[
      {pubkey:pda_account,isSigner:false,isWritable:true},
      {pubkey:payer.publicKey,isSigner:true,isWritable:false},
    ],
  });
  let transaction = new Transaction().add(instruction);
  let sig = await sendAndConfirmTransaction(connection,transaction,[payer]);
  console.log("Requesting...",sig);
}

export async function report(){
  let connection = new Connection(clusterApiUrl());
  let pda_account = new PublicKey("your PDA address");
  const accountInfo = await connection.getAccountInfo(pda_account);
  const stored_data = borsh.deserialize(
    SCHEMA,
    Message,
    accountInfo.data.slice(0,accountInfo.data[0]+4),
  );
  
  console.log(accountInfo.data,"\n",stored_data);
}








