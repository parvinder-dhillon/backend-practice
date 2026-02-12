import mongoose,{Schema} from "mongoose";

const likesschema = new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }
},{timestamps:true}
)
export const Like = mongoose.model("Like",likesschema)