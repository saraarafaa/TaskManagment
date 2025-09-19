import mongoose from "mongoose";

export const checkConnectionDB = async() =>{
  await mongoose.connect(process.env.DB_URL_ONLINE).then(() =>{
    console.log('Connected to DB successfully');
  }).catch((err) =>{
    console.log('Failed to connect');
  })

}