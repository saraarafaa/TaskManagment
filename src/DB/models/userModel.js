import mongoose from "mongoose";

export const userRole = {
  user: 'user',
  admin: 'admin'
}

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(userRole),
    default: userRole.user
  },
  confirmed:{
    type: Boolean,
    default: false
  },
  OTP: String
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel