import { Router } from "express";
import { loginUser, refreshAccessToken  } from "../controllers/user.controllers.js";

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



export default router


 