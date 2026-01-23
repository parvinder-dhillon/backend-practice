// import dotenv from "dotenv";
// import app from "../app.js";
// import mongoose from "mongoose";

// dotenv.config();

// const PORT = process.env.PORT || 8000;

// (async () => {
//   try {
//     console.log("⏳ Connecting to database...");

//     await mongoose.connect(process.env.MONGODB_URI);

//     console.log("✅ Database connected");

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });

//   } catch (error) {
//     console.error("❌ Error:", error);
//     process.exit(1);
//   }
// })();

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{ 
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Mongodb Connected !! DB HOST: ${connectionInstance.connection.host}`);
 

    }
    catch (error){
        console.log("MONGODB CONNECTION ERROR!",error);
        process.exit(1)
    }
}
export default connectDB