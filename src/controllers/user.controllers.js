

 import { asyncHandler } from "../utils/asyncHandler.js";

 import { ApiError } from "../utils/ApiError.js";

 import { User } from "../models/user.model.js";

 import { uploadoncloudinary } from "../utils/cloudinary.js";

 import { ApiResponse } from "../utils/ApiResponce.js";

import jwt from "jsonwebtoken";
//   const generateAccessAndRefereshTokens = async(userId)=>{
//   try{
//   const user = await User.findById(userId);

//    const accessToken=user.generateAccessToken()
//    const refreshToken=user.generateRefreshToken()
// //    console.log(accessToken, refreshToken)

//    user.refreshToken = refreshToken
//    await user.save({validateBeforeSave:false});
//    return {accessToken,refreshToken}

    


//   } catch(error){
//     throw new ApiError(500,"Somethings went wrong while generating refresh and accrss token")
//   } 
//  }

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

  
   

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

       const exitedUser= await  User.findOne({
            $or:[{username},{email}]
        })

        if(exitedUser){
            throw new ApiError(409," user already exists")
        }

        //  console.log( req.files)

      const avatarLocalPath=   req.files?.avatar[0]?.path;
    //   const coverImageLocalPath= req.files?.coverImage[0]?.path;

      let coverImageLocalPath ;
      if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){

        coverImageLocalPath = req.files.coverImage[0].path

      }



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

  const loginUser = asyncHandler (async(req,res)=>{
    //  req body -> data
    // username or email
    //  find the user
    //  password check
    // send cookes
    //  

    const { email,username ,password} = req.body 
    if(!username &&! email){
        throw new ApiError (400,"username or password is required")
    }

     const user =await User.findOne({
        $or:[{username},{email}]
     })

     if(!user) {
        throw new ApiError(400,"user not found")
     }

     const isPasswordValid= await  user.isPasswordCorrect(password)

     if(!isPasswordValid) {
        throw new ApiError(400," in valid not found")
     }

      const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)

      const refreshTokenValue = await refreshToken;

           const accessTokenvalue = await accessToken;

      

      const loggedInUser = await User.findById(user._id)
    //   .select("-password -refreshToken")
      
      const options = {
        httpOnly:true,
        secure:true
      }
        // console.log(accessToken,refreshToken);
      return res.status(200).cookie("accessTokenvalue",accessTokenvalue,options).cookie("refreshTokenvalue",refreshTokenValue,options).json(
        
        new ApiResponse(
            200, {
                 
                user:loggedInUser ,accessTokenvalue,refreshTokenValue
            },
            
             

            "User logged in Successfully"

        )
      )




  })


// const loginUser = asyncHandler(async (req, res) =>{
//     // req body -> data
//     // username or email
//     //find the user
//     //password check
//     //access and referesh token
//     //send cookie

//     const {email, username, password} = req.body
//     console.log(email);

//     if (!username && !email) {
//         throw new ApiError(400, "username or email is required")
//     }
    
//     // Here is an alternative of above code based on logic discussed in video:
//     // if (!(username || email)) {
//     //     throw new ApiError(400, "username or email is required")
        
//     // }

//     const user = await User.findOne({
//         $or: [{username}, {email}]
//     })

//     if (!user) {
//         throw new ApiError(404, "User does not exist")
//     }

//    const isPasswordValid = await user.isPasswordCorrect(password)

//    if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid user credentials")
//     }

//    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//         new ApiResponse(
//             200, 
//             {
//                 user: loggedInUser, accessToken, refreshToken
//             },
//             "User logged In Successfully"
//         )
//     )

// })

//    const logoutUser = asyncHandler (async(req,res)=>{
//     await  User.findByIdAndUpdate(
//         req.user._id,{
//             $set:{
//                 refreshToken: undefined
//             }
//         },
//         {
//            new: true  
//         }
//     )

     
//     const options = {
//         httpOnly:true,
//         secure:true
//       }

      
//       return res
//       .status(200)
//       .clearCookie("accessToken",accessToken,options)
//       .clearCookie("refreshToken",refreshToken,options)
//       .json(
//         new ApiResponse(
//             200, {},

//             "User logged in Successfully"
//         )
//     )


//    })

// const loginUser = asyncHandler(async (req, res) =>{
//     // req body -> data
//     // username or email
//     //find the user
//     //password check
//     //access and referesh token
//     //send cookie

//     const {email, username, password} = req.body;

//     if (!username && !email) {
//         throw new ApiError(400, "Username or email is required");
//     }
    
//     // Find the user by username or email
//     const user = await User.findOne({
//         $or: [{username}, {email}]
//     });

//     if (!user) {
//         throw new ApiError(404, "User does not exist");
//     }

//     // Check if the provided password is correct
//     const isPasswordValid = await user.isPasswordCorrect(password);

//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid user credentials");
//     }

//     // Generate access and refresh tokens
//     const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);
      
//     const refreshTokenValue = await refreshToken;

//     const accessTokenvalue = await accessToken

    
//     // Find the logged-in user and exclude sensitive information
//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

//     const options = {
//         httpOnly: true,
//         secure: true
//     };

     

//     // Set access and refresh tokens as cookies and send JSON response
//     return  res
//         .status(200)
//         .cookie("accessTokenvalue", accessTokenvalue, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(
//             new ApiResponse(
//                 200, 
//                 {
//                     user: loggedInUser, 
//                     accessTokenvalue, 
//                     refreshTokenValue,
                     
//                 },
//                 "User logged In Successfully",
                
//             )
//         );
// });


const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessTokenvalue", options)
    .clearCookie("refreshTokenvalue", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

 const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomeingRefreshToken= req.cookies.refreshTokenValue ||req.body.refreshTokenvalue

    if(!incomeingRefreshToken){
        throw new ApiError(400,"unauthenticated request")
    }

     try {
         const decodedtoken= jwt.verify(incomeingRefreshToken,process.env.REFRESH_TOKEN_SECRT)
   
         const user= User.findById(decodedtoken?._id)
   
         if( !user){
           throw new ApiError(400,"invalid refreshtoken request")
       }
   
        if(incomeingRefreshToken !==user?.refreshToken){
           throw new ApiError(400,"invalid refreshtoken Experid")
    
        }
   
        const options = {
           httpOnly:true,
           secure:true
        }
   
           const {accessToken,newrefreshToken}=await generateAccessAndRefereshTokens(user._id)
   
           const accessTokenvalue1 = await accessToken;
   
           const refereshTokenvalue1= await newrefreshToken;
   
         return res
         .status(200)
         .cookie("accessTokenvalue1",accessTokenvalue1,options)
         .cookie("refreshTokenvalue1",refereshTokenvalue1,options)
         .json(
           new ApiResponse(
               {accessTokenvalue1,refreshToken:refereshTokenvalue1},
               " Access token refreshed"
           )
         )
     } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refresh token")
        
     }
       
    })

    const changeCurrentPassword = asyncHandler(async(res,req,next)=>{

        const  {oldPassword,newPassword} = req.body;
       const user= User.findById( req.user?._id)

       const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

       if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid old  password")
       }

       user.password = newPassword
       await user.save({validateBeforeSave:false})

       return res.status(200).json(new ApiResponse (200,{},"Password changed successfully"))

    })

    const getCurrentUser = asyncHandler(async(res,req,next)=>{
        return res.status(200).json(200,req.user," current user fetched successfully")

    })

    const updateAccountDetails = asyncHandler(async(res,req,next)=>{

        const  {fullname,email} = req.body

        if(!fullname || !email){
            throw new ApiError(400,"All fields are required")
        }

     const user=   User.findByIdAndUpdate(req.user?._id,
        {

            $set:{
                fullname:fullname,
                email:email
            }


     },{new:true}).select("-password")

     return res.status(200).json(new ApiResponse (200,user,"Account updated successfully"))
    })

    const updateUserAvatar = asyncHandler(async(res,req,next)=>{
        const avatarLocalPath= req.file?.path
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar  file not found")

           
        }

        const avatar=  await uploadoncloudinary(avatarLocalPath)
            
        if(!avatar.url){
            throw new ApiError(400,"Avatar url not uploding found")
        }

        const user=  await User.findByIdAndUpdate(
            req.user?._id,{
                $set:{
                    avatar:avatar.url
                }
            }
          )

          return res.status(200).json(
            new ApiResponse(200,user,"Avatar updated successfully"
           ))
    })

    const updateUserCoverImage = asyncHandler(async(res,req,next)=>{
        const coverImageLocalPath= req.file?.path
        if(!coverImageLocalPath){
            throw new ApiError(400,"imagecover  file not found")

           
        }

        const coverImage=  await uploadoncloudinary(coverImageLocalPath)
            
        if(!coverImage.url){
            throw new ApiError(400,"coverImage url not uploding found")
        }

          const user= await User.findByIdAndUpdate(
            req.user?._id,{
                $set:{
                    coverImage:coverImage.url
                }
            }
          )
          return res.status(200).json(
            new ApiResponse(200,{},"User updated coverImage successfully")
            
            )
  
    })

  export {registerUser, loginUser,logoutUser ,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage}