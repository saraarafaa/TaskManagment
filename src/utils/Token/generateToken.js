import jwt from 'jsonwebtoken'

export const generateToken = async({payload, signiture, options}) =>{
  return jwt.sign(payload, signiture, options)
}