
 import mongoose ,{Schema} from 'mongoose';

 import jwt from 'jsonwebtoken';

 import bcrypt from 'bcrypt'

  const userSchema = new Schema({
    username :{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
     
    email :{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
         
    },

    fullname :{
        type: String,
        required: true,
         
        trim: true,
        index: true
    },

    avatar    :{
        type: String,
        required: true,
         
    },

    coverImage:{
        type: String,
    },

     watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
     ],

     password :{
        type: String,
        required: [true, 'password  is required']
     },

     refreshToken :{
        type: String

     }

    },{ timestamps: true}


  )

  userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
    // console.log(this.password)
  })

  userSchema.methods.isPasswordCorrect= async function (password){
    if (!password || !this.password) {
        return false; // Return false if either password is missing
    }
    return await bcrypt.compare(password,this.password)
  }

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next(); // Only hash the password if it's modified
//     try {
//         // Hash the password using bcrypt
//         const hashedPassword = await bcrypt.hash(this.password, 10);
//         this.password = hashedPassword; // Set the hashed password
//         next();
//     } catch (error) {
//         next(error); // Pass any errors to the next middleware
//     }
// });

// userSchema.methods.isPasswordCorrect = async function (password) {
//     try {
//         // Ensure both password and this.password exist
//         if (!password || !this.password) {
//             return false; // Return false if either password is missing
//         }
//         // Compare plaintext password with hashed password
//         return await bcrypt.compare(password, this.password);
//     } catch (error) {
//         return false; // Return false in case of any errors
//     }
// };


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
       expiresIn:  process.env.ACCESS_TOKEN_EXPIRY
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
