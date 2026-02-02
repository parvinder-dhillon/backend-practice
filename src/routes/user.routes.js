import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),

    registerUser
)
router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT,logoutUser)


// router.route("/logout", (req, res) => {
//     console.log("logoute route hit");
//     res.json({ ok: true });
// });

export default router;



