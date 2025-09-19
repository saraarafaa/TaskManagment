import bcrypt from 'bcrypt'

export const Hash = async({plainText, saltRounds = process.env.SALT_ROUNDS}) =>{
  return bcrypt.hashSync(plainText, +saltRounds)
}