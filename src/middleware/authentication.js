import revokeTokenModel from "../DB/models/revokeTokenModel.js";
import userModel from "../DB/models/userModel.js";
import { verifyToken } from "../utils/index.js";

export const authentication = async(req, res, next) =>{
  const {authorization} = req.headers
  const [prefix, token] = authorization.split(" ") || []

  if(!prefix || !token)
    throw new Error("token Not sent", {cause: 404});
    
  let signiture = ''
  if(prefix == process.env.USER)
    signiture = process.env.ACCESS_SIGNITURE_USER
  else if(prefix == process.env.ADMIN)
    signiture = process.env.ACCESS_SIGNITURE_ADMIN
  else
    throw new Error("InValid prefix", {cause: 400});

  const decode = await verifyToken({token, signiture})

  const revoked = await revokeTokenModel.findOne({tokenId: decode.jti})
  if(revoked)
    throw new Error("User Logged Out", {cause: 400});
    
  const user = await userModel.findOne({email: decode.email})
  if(!user)
    throw new Error("User not Found", {cause: 404});

  req.user = user
  req.decode = decode

  return next()
    
}