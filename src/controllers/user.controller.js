import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { apiResponse } from "../utils/apiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req, res) => {
   //get user details from frontend
   //    validation = not empty 
   // check if user exist already
   // check for image , check for avatar
   // upload it on cloudnery, check for avatar again
   // create user object = create entry in db 
   //remove password and refresh token fields from response
   //check for user creation 
   // return the response 

   const { fullName, password, userName, email } = req.body
   // console.log("email:", email);
   if (
      [fullName, email, userName, password].some((field) => field?.trim() === "")
   ) {
      throw new ApiError(400, "All fields are required")
   }
   const existedUser = await User.findOne({
      $or:[{ userName },{ email }]
   })
   if(existedUser){
      throw new ApiError(409,"user existed already");
   }
   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path
   }

   // console.log(req.files);

   if(!avatarLocalPath){
      throw new ApiError(400,"avatar is required")
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
      throw new ApiError(400,"avatar is required")
   }
   const user = await User.create({
      fullName,
      avatar:avatar.url,
      coverImage:coverImage?.url||"",
      email,
      password,
      userName:userName.toLowerCase()
   })
   const userCreated = await User.findById(user._id).select("-password -refreshToken")
   if(!userCreated){
      throw new ApiError(500,"something went wrong while registring the user")
   }
   return res.status(201).json(
      new apiResponse(200,userCreated,"User created succesfully")
   )
      
})
export { registerUser }