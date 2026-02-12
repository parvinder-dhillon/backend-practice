import mongoose,{ Schema } from "mongoose";
const playlistschema = new Schema({
    name:{
        type: String,
        required:true
    },
    discription:{
        type:String
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true}
)
export const Playlist = mongoose.model("Playlist",playlistschema)
