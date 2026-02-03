import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// Method for genrate access token and refresh token becouse we have to genrate this more than one time 
// this is our internal method means no database call that's why there is no need for asynchandler method

const generateAccessTokenAndRefreshTokens = async (userId) => {
   
   try {
      const user = await User.findById(userId)
//       console.log("has access method:", typeof user.generateAccessToken)
// console.log("has refresh method:", typeof user.generateRefreshToken)
      const accessToken= user.generateAccessToken()
      const refreshToken= user.generateRefreshToken()
      user.refreshToken =refreshToken
      await user.save({validateBeforeSave: false})

      return{accessToken,refreshToken}
      
   }
   catch (error) {
      throw new ApiError(500, "Something went wrong while generating access token and refresh token")
     

   }


   

}
         //registering user 
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
      $or: [{ userName }, { email }]
   })
   if (existedUser) {
      throw new ApiError(409, "user existed already");
   }
   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
   }

   // console.log(req.files);

   if (!avatarLocalPath) {
      throw new ApiError(400, "avatar is required")
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "avatar is required")
   }
   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      userName: userName.toLowerCase()
   })
   const userCreated = await User.findById(user._id).select("-password -refreshToken")
   if (!userCreated) {
      throw new ApiError(500, "something went wrong while registring the user")
   }
   return res.status(201).json(
      new apiResponse(200, userCreated, "User created succesfully")
   )

})
         // login user

const loginUser = asyncHandler(async (req, res) => {
   // steps to login a user in the website
   // request and get data 
   // check user email and password
   // find the user 
   // password check 
   // access and refresh token
   // send cookie

   // request to get data
   const {email, userName, password } = req.body
   // check userName and email 

   // if (!(userName || email)) {
   //    throw new ApiError(400, "username or password is required ")
   // }

   if (!(userName && email)) {
      throw new ApiError(400, "username/email and password are required")
    }
   const user = await User.findOne({
      $or: [{ userName }, { email }]
   })
   if (!user) {
      throw new ApiError(404, "user does not exist")
   }

   //  check password correct or not 

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
      throw new ApiError(401, "inavalid user credentials")
   }
                //calling method to genrate access token and refresh token 
   const{accessToken,refreshToken} = await generateAccessTokenAndRefreshTokens(user._id)
   // /Database call for managing fields for loggedInUser, user have all the field exept of password and refresh token
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

          //now send cokies with costomisation becouse by defoult coskies can be modiefied by anyone on frontend but by this costomisation cokies only be modiefied by server

   const options ={
      httpOnly:true,
      secure:true
   }       
   
           // return response

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
      new apiResponse(
         200,
         {
            user:loggedInUser,accessToken,refreshToken
         },
         "user logged in successfully"

      )
   )

})
        //  logout user
const logoutUser = asyncHandler(async (req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      
      {
         $set:{
            refreshToken:undefined
         }
      },
      {
         new:true
      }
      
   )
   
   const options ={
      httpOnly:true,
      secure:true
   }       
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new apiResponse(200,{},"user logged out"))

})


const refreshAccessToken =asyncHandler(async (req,res)=>{
   const incomingRefreshToken=req.cookie.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
      throw new ApiError(401,"unauthorized request")
   }
  try {
    const decodedToken = jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
    if(!user){
       throw new ApiError(401,"invalid refresh token")
    }
    if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401,"refresh token is expired or used")
    }
    const options={
       httpOnly:true,
       secure:true
    }
    const{accessToken,newrefreshToken} = await generateAccessTokenAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken",newrefreshToken)
    .json(
       new apiResponse(
          200,
          {accessToken, refreshToken:newrefreshToken},
          "Access token refreshed successfully"
       )
    )
  } catch (error) {
   throw new ApiError(401,error?.message||"invalid refresh token")
  }

})

export { registerUser, loginUser , logoutUser,refreshAccessToken}