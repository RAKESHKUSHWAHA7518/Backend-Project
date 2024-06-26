

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

//  const refreshAccessToken = asyncHandler(async(req, res) => {
//     const incomeingRefreshToken =  await req.cookies.refreshTokenValue || req.body.refreshTokenvalue
//     console.log(incomeingRefreshToken);
//     if(!incomeingRefreshToken){
//         throw new ApiError(400,"unauthenticated request")
//     }

//      try {
//          const decodedtoken= jwt.verify(incomeingRefreshToken,process.env.REFRESH_TOKEN_SECRT)
   
//          const user= User.findById(decodedtoken?._id)
   
//          if( !user){
//            throw new ApiError(400,"invalid refreshtoken request")
//        }
   
//         if(incomeingRefreshToken !==user?.refreshToken){
//            throw new ApiError(400,"invalid refreshtoken Experid")
    
//         }
   
//         const options = {
//            httpOnly:true,
//            secure:true
//         }
   
//            const {accessToken,newrefreshToken}=await generateAccessAndRefereshTokens(user._id)
   
//            const accessTokenvalue1 = await accessToken;
   
//            const refereshTokenvalue1= await newrefreshToken;
   
//          return res
//          .status(200)
//          .cookie("accessTokenvalue1",accessTokenvalue1,options)
//          .cookie("refreshTokenvalue1",refereshTokenvalue1,options)
//          .json(
//            new ApiResponse(
//                {accessTokenvalue1,refreshToken:refereshTokenvalue1},
//                " Access token refreshed"
//            )
//          )
//      } catch (error) {
//         throw new ApiError(401,error?.message||"Invalid refresh token")
        
//      }
       
//     })

// const refreshAccessToken = asyncHandler(async(req, res) => {
//      const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;

//      console.log(incomingRefreshToken);
//     if (!incomingRefreshToken) {
//         throw new ApiError(400, "Unauthenticated request");
//     }

//     try {
//         const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

//         const user = await User.findById(decodedToken?._id);

//         if (!user) {
//             throw new ApiError(400, "Invalid refresh token request");
//         }

//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ApiError(400, "Invalid refresh token expired");
//         }

//         const options = {
//             httpOnly: true,
//             secure: true
//         };

//         const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", newRefreshToken, options)
//             .json(new ApiResponse({
//                 accessToken,
//                 refreshToken: newRefreshToken
//             }, "Access token refreshed"));
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid refresh token");
//     }
// });


    // const changeCurrentPassword = asyncHandler(async(res,req,next)=>{

    //     const  {oldPassword,newPassword} = req.body;
    //    const user= User.findById( req.user?._id)

    //    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    //    if(!isPasswordCorrect){
    //     throw new ApiError(401,"Invalid old  password")
    //    }

    //    user.password = newPassword
    //    await user.save({validateBeforeSave:false})

    //    return res.status(200).json(new ApiResponse (200,{},"Password changed successfully"))

    // })


    const refreshAccessToken = asyncHandler(async (req, res) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request")
        }
    
        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
        
            const user = await User.findById(decodedToken?._id)
        
            if (!user) {
                throw new ApiError(401, "Invalid refresh token")
            }
        
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used")
                
            }
        
            const options = {
                httpOnly: true,
                secure: true
            }
        
            const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
        
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            )
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token")
        }
    
    })

 

    const changeCurrentPassword = asyncHandler(async(req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        
        try {
            const user = await User.findById(req.user?._id);
    
            const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        
                
            if (!isPasswordCorrect) {
                throw new ApiError(401, "Invalid old password");
            }
    
            user.password = newPassword;
            await user.save({ validateBeforeSave: false });
    
            return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
        } catch (error) {
            next(error); // Pass any errors to the next middleware
        }
    });
    

    // const changeCurrentPassword = asyncHandler(async(req, res) => {
    //     const {oldPassword, newPassword} = req.body
    
        
    
    //     const user = await User.findById(req.user?._id)
    //     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    //     if (!isPasswordCorrect) {
    //         throw new ApiError(400, "Invalid old password")
    //     }
    
    //     user.password = newPassword
    //     await user.save({validateBeforeSave: false})
    
    //     return res
    //     .status(200)
    //     .json(new ApiResponse(200, {}, "Password changed successfully"))
    // })
    
    
    




    // const getCurrentUser = asyncHandler(async(res,req,next)=>{
    //     return res.status(200).json(200,req.user," current user fetched successfully")

    // })


    const getCurrentUser = asyncHandler(async(req, res) => {
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
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

     const getUserChannelProfile = asyncHandler(async(res,req,next)=>{
         const  {username} = req.params

         if(!username?.trim()){
            throw new ApiError(400,"username is missing")

         }

          const channel = await User.aggregate([
            {
               $match:{
                username: username?.toLowerCase()
               } 
            },
            {
                $lookup:{
                    from: "Subscription",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"

                }
            },

            {
                $lookup:{
                    from: "Subscription",
                    localField: "_id",
                    foreignField: "subscribers",
                    as: "subscribedTo"

                }
            },
            
            {
               $addFields : {
                subscribersCount:{
                    $size : "$subscribers"
                },
                channelsSubscribedToCount : {
                    $size: "subscribedTo"
                },

                isSubscribed :{
                    $cond : {
                        if:{
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                         then: true,
                         else: false
                    }
                }
               } 

            }, 
            {
                $project : {
                    fullname:1,
                    username: 1,
                    subscribersCount: 1,
                    isSubscribed: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    channelsSubscribedToCount: 1,



                }
            }



          ])

          if (!channel?.length){
            throw new ApiError (400, "channel does not exist")
          }

          return  res
          .status(200)
          .json(
            new ApiResponse (200, " user channel is sucessfully fetch")
          )



     })


      const getWatchHistory = asyncHandler (async(res,req,next)=> {

        const user = await User.aggregate ([
             {
                $match : {
                    _id: new Mongoose.Types.ObjectId(req.user.id)
                }

             },

             {
                $lookup : {
                    from: "video",
                    localField: " watchHistory",
                    foreignField : "_id",
                    as: "watchHistory",
                    pipeline: [
                       {
                        $lookup :{
                            from : "users",
                            localField: "owner",
                            foreignField: " _id",
                            as : " owner",
                            pipeline:[
                                {
                                    $project :{
                                        fullname: 1,
                                        username :1,
                                        avatar: 1,

                                    }
                                }
                            ]
                        }
                       }  
                       ,

                       {
                        $addFields : {
                            owner: {
                                $first:  "$owner"
                            }
                        }
                       }
                    ]
                }


             }

        ])

        return res
        .status(200)
        .json(
            new ApiResponse(400, user[0].watchHistory, "Watch history fetch successfully  ")
        )

      })

  export {registerUser, loginUser,logoutUser ,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage ,getWatchHistory,getUserChannelProfile}