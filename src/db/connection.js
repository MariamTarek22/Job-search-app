import mongoose from "mongoose";
async function connectDB(){
    await mongoose.connect(process.env.DB_URL).then(()=>{
        console.log("Connected to MongoDB successfully");
    }).catch((error)=>{
        console.log("Error connecting to MongoDB",error);
    })
}
export default connectDB 