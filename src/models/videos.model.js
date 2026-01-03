import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudnary url
            required : true

        },
        thumbnail:{
            type: String,
            required:true
        },
        title:{
            type:String, //cloudnery url
            required:true
        },
        description:{
            type:String, //cloudnery url
            required:true
        },
        duration:{
            type:Number, //cloudnery url
            required:true
        },
        views:{
            type:Number,
            default: 0
        },
        isPublished:{
            type:Boolean,
            default: true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    }, 
    {
        timestamps:true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const video = mongoose.model("video",videoSchema)