import jwt from 'jsonwebtoken'

export const verifyToken = async({token, signiture}) =>{
  return jwt.verify(token, signiture)
}