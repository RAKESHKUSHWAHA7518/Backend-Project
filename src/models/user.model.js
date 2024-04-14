
 import mongoose ,{Schema} from 'mongoose';

 import jwt from 'jsonwebtoken';

 import bcrypt from 'bcrypt'

  const userSchema = new Schema({
    username :{
        type: string,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
     
    email :{
        type: string,
        required: true,
        lowercase: true,
        trim: true,
         
    },

    fullname :{
        type: string,
        required: true,
         
        trim: true,
        index: true
    },

    avatar    :{
        type: string,
        required: true,
         
    },

    coverImage:{
        type: string,
    },

     watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
     ],

     passwork :{
        type: String,
        required: [true, 'password  is required']
     },

     refreshToken :{
        type: String

     }

    },{ timestamps: true}


  )

  userSchema.pre("save",async function(next){
    if(this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
  })

  userSchema.methods.isPasswordCorrect= async function (password){
    return await bcrypt.compare(password,this.password)
  }

  userSchema.methods.generateAccessToken= async function(){
    return jwt.sign(
        {
           _id: this.id,
           email: this.email,
           username: this.username ,
           fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRT,
        {
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
  }

  userSchema.methods.generateRefreshToken= async function(){
    return jwt.sign(
        {
           _id: this.id,
           email: this.email,
           username: this.username ,
           fullname: this.fullname
        },
        process.env.REFRESH_TOKEN_SECRT,
        {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
  }


  export const User = mongoose.model('User',userSchema);
