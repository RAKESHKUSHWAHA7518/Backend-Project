

 import { asyncHandler } from "../utils/asyncHandler.js";

 import { ApiError } from "../utils/ApiError.js";

 import { User } from "../models/user.model.js";

 import { uploadoncloudinary } from "../utils/cloudinary.js";

 import { ApiResponse } from "../utils/ApiResponce.js";

  const registerUser = asyncHandler(async(req,res)=>{
    //   GET USER DETAIL FRPM FRONTEND
    // VALIDATION - NOT EMPTY
    //  CHECK IF USER ALREADY EXISTI
    //  CHECK AVATAR - UPLOADS CLUDANARY
    //  CHECK SUCCESSFUL UPLOADE OR NOT
    //  CREATE USER OBJECT 
    //  REMOVE PASSWORD
    // CHECK FOR USER CREATION


     const {fullname ,email ,username ,password   }=req.body

     console.log( "email: " + email);

    //  if(fullname===""){
    //     throw new ApiError(400,"Full name req")
    //  }

    if(
        [fullname,email,username,password].some((field)=>
        field?.trim()==="")

        ){
     throw new ApiError(400,"All fields are required")
        }

       const exitedUser=  User.findOne({
            $or:[{username},{email}]
        })

        if(exitedUser){
            throw new ApiError(409," user already exists")
        }


      const avatarLocalPath=   req.files?.avatar[0]?.path;
      const coverImageLocalPath= req.files?.coverImage[0]?.path;


      if(!avatarLocalPath){
        throw new ApiError(400,"Missing avatar")
      }

      const avatar=  await  uploadoncloudinary(avatarLocalPath)

      const coverImage= await uploadoncloudinary(coverImageLocalPath)

      if(!avatar){
        throw new ApiError(400,"Avatar not found")
      }

      const user= await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase(),

      })

     const createdUser= await  User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw  new ApiError(500," simething user not found")
    }
    return res.status(201).json(
        new ApiResponse (200,createdUser,"user registerUserSuccess fully")
    )
    
  })

  export {registerUser}