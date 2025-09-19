import { nanoid } from "nanoid";
import userModel, { userRole } from "../../DB/models/userModel.js";
import { eventEmitter } from "../../utils/Email/index.js";
import {
  Compare,
  generateToken,
  Hash,
  verifyToken,
} from "../../utils/index.js";
import { customAlphabet } from "nanoid";
import revokeTokenModel from "../../DB/models/revokeTokenModel.js";

//REGISTER
export const userRegister = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (await userModel.findOne({ email }))
    throw new Error("User Already exists", { cause: 409 });

  const hashedPassword = await Hash({
    plainText: password,
    saltRounds: process.env.SALT_ROUNDS,
  });

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    role,
  });
  eventEmitter.emit("sendEmail", { email });

  return res.status(201).json({ message: "User created successfully", user });
};

//CONFIRM EMAIL
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  if (!token) throw new Error("Token not sent", { cause: 404 });

  const decode = await verifyToken({ token, signiture: process.env.SIGNITURE });
  const user = await userModel.findOne({
    email: decode.email,
    confirmed: false,
  });
  if (!user)
    throw new Error("Email not exists or already confirmed", { cause: 400 });

  user.confirmed = true;
  await user.save();

  return res.status(200).json({ message: "Confirmed" });
};

//LOGIN
export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email, confirmed: true });
  if (!user)
    throw new Error("User Not Found Or Not Confirmed Yet", { cause: 404 });

  const validPassword = await Compare({
    plainText: password,
    cipherText: user.password,
  });
  if (!validPassword) throw new Error("InValid password", { cause: 401 });

  const access_token = await generateToken({
    payload: { id: user._id, email: user.email },
    signiture:
      user.role == userRole.admin
        ? process.env.ACCESS_SIGNITURE_ADMIN
        : process.env.ACCESS_SIGNITURE_USER,
    options: { expiresIn: "1d", jwtid: nanoid() },
  });

  const refresh_token = await generateToken({
    payload: { id: user._id, email: user.email },
    signiture:
      user.role == userRole.admin
        ? process.env.REFRESH_SIGNITURE_ADMIN
        : process.env.REFRESH_SIGNITURE_USER,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  return res.status(200).json({
    message: "User LoogedIn successfully",
    access_token,
    refresh_token,
  });
};

//GET PROFILE
export const profile = async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  return res
    .status(200)
    .json({ message: "User profile retreived successfully", user });
};

//UPDATE PROFILE
export const updateProfile = async (req, res, next) => {
  const { name, email } = req.body;

  if (name) req.user.name = name;
  if (email) {
    if (await userModel.findOne({ email }))
      throw new Error("User already exists", { cause: 409 });
    eventEmitter.emit("sendEmail", { email });

    req.user.email = email;
    req.user.confirmed = false;
  }

  await req.user.save();

  return res
    .status(200)
    .json({ message: "User profile updated successfully", user: req.user });
};

//DELETE MY ACCOUNT
export const deleteMe = async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req.user._id);
  return res
    .status(200)
    .json({ message: "Account deleted successfully", user });
};

//DELETE BY ADMIN
export const deleteAccount = async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel.findByIdAndDelete(id);
  if (!user) {
    throw new Error("User Not Found", { cause: 404 });
  }
  return res
    .status(200)
    .json({ message: "Account deleted successfully", user });
};

//GET ALL USERS
export const getUsers = async (req, res, next) => {
  const users = await userModel.find();
  if (!users) throw new Error("No User found", { cause: 404 });

  return res
    .status(200)
    .json({ message: "success", userCount: users.length, users });
};

//LOGOUT
export const userLogout = async (req, res, next) => {
  const revoke = await revokeTokenModel.create({
    tokenId: req.decode.jti,
    expireAt: req.decode.exp,
  });
  return res
    .status(200)
    .json({ message: "User Logged Out Successfully", revoke });
};

//REFRESH TOKEN
export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const [prefix, token] = authorization.split(" ") || [];

  let signiture = "";
  if (!prefix || !token) throw new Error("Token Not Sent", { cause: 404 });

  if (prefix == process.env.USER)
    signiture = process.env.REFRESH_SIGNITURE_USER;
  else if (prefix == process.env.ADMIN) signiture = REFRESH_SIGNITURE_ADMIN;
  else throw new Error("InValid prefix", { cause: 400 });

  const decode = await verifyToken({ token, signiture });
  if (!decode?.email) throw new Error("InValid token", { cause: 400 });

  const revoked = await revokeTokenModel.findOne({ tokenId: decode.jti });
  if (revoked) throw new Error("User Logged out", { cause: 400 });

  const user = await userModel.findOne({ email: decode.email }).lean();
  if (!user) throw new Error("User Not Found", { cause: 404 });

  const access_token = await generateToken({
    payload: { id: user.id, email: user.email },
    signiture:
      user.role == userRole.user
        ? process.env.ACCESS_SIGNITURE_USER
        : process.env.ACCESS_SIGNITURE_ADMIN,
    options: { expiresIn: "1d", jwtid: nanoid() },
  });

  const refresh_token = await generateToken({
    payload: { id: user.id, email: user.email },
    signiture:
      user.role == userRole.user
        ? process.env.REFRESH_SIGNITURE_USER
        : process.env.REFRESH_SIGNITURE_ADMIN,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  return res
    .status(201)
    .json({ message: "Success", access_token, refresh_token });
};

//UPDATE PASSWORD
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (
    !(await Compare({
      plainText: oldPassword,
      cipherText: req?.user?.password,
    }))
  )
    throw new Error("InValid Password", { cause: 400 });

  const hashedPassword = await Hash({ plainText: newPassword });
  req.user.password = hashedPassword;
  await req.user.save();

  await revokeTokenModel.create({
    tokenId: req?.decode?.jti,
    expireAt: req?.decode?.exp,
  });

  return res.status(200).json({ message: "Password Updated", user: req.user });
};

//FORGET PASSWORD
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User Not Found", { cause: 404 });

  const OTP = customAlphabet("0123456789", 4)();

  eventEmitter.emit("forgetPassword", { email, OTP });

  user.OTP = await Hash({ plainText: OTP });
  await user.save();

  return res.status(200).json({ message: "OTP Sent to your email" });
};

//RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  const { email, OTP, newPassword } = req.body;

  const user = await userModel.findOne({ email, OTP: { $exists: true } });
  if (!user) throw new Error("User Not Found Or Expired OTP", { cause: 404 });

  const checkOTP = await Compare({ plainText: OTP, cipherText: user?.OTP });
  if (!checkOTP) throw new Error("InValid OTP", { cause: 400 });

  const hashedPassword = await Hash({ plainText: newPassword });

  await userModel.updateOne(
    { email },
    {
      password: hashedPassword,
      $unset: { OTP: "" },
    }
  );

  return res.status(200).json({ message: "Password reset successfully" });
};
