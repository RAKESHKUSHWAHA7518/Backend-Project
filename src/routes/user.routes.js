import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, refreshAccessToken, updateAccountDetails, updateUserAvatar, updateUserCoverImage  } from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlerwares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

import { registerUser } from "../controllers/user.controllers.js";

import { logoutUser } from "../controllers/user.controllers.js";

const router= Router();

router.route("/register").post(
    upload.fields( [
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

    router.route ("/login").post(loginUser)

    router.route("/logout").post(verifyJWT,logoutUser)

    router.route("/refresh").post(refreshAccessToken)

    router.route("/changePassword").post(verifyJWT,changeCurrentPassword)

    router.route("/currentuser").get(verifyJWT,getCurrentUser)

    router.route("/update").patch(verifyJWT,updateAccountDetails)

    router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)

    router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"),updateUserCoverImage)

    router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

    router.route("/history").get(verifyJWT, getWatchHistory)
    

    


export default router


 