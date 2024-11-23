import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI
const ATLAS_URI = process.env.ATLAS_URI

mongoose.set('strictQuery', true)

const connection = async() => {
  try{
    const {connection} = await mongoose.connect(ATLAS_URI || MONGO_URI)
    console.log(`Database has established on MongoDB server as ${connection.host} - ${connection.port}`)
    console.log("-----------------------------------------------------------------------\n")
  }
  catch (e) {
    console.log(`An error occurred: ${e}`);
  }
}

export default connection;
