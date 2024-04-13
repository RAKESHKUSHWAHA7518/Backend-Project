 
  import mongoose , {Schema} from 'mongoose';

  import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

   const videoSchema = new Schema({
  
    videoFile:{
        type: string,
        required: true,
  
      },

      thumbnail:{
        type: string,
        required: true,
      },

      title:{
        type: string,
        required: true,
      },

      description:{
        type: string,
        required: true,
      },

      durations:{
         
            type: string,
            required: true,
          
      },

       views :{
        type: Number,
        default:0
       },

       isPublished:{
        type: Boolean,
        default:true
       } ,

       owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
       }




   }, {timestamps: true})

   

   videoSchema.plugin(mongooseAggregatePaginate)

   export const Video = mongoose.model('Video',videoSchema)