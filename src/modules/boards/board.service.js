import boardModel from "../../DB/models/boardModel.js"
import userModel, { userRole } from "../../DB/models/userModel.js"

//CREATE BOARD
export const createBoard = async(req, res, next) =>{
  const {title} = req.body

  const board = await boardModel.create({title, owner: req.user._id, members: req.user._id})
  return res.status(201).json({message: 'Board Created successfully', board})
}

//GET MY BOARDS
export const getMyBoards = async(req, res, next) =>{
  const boards = await boardModel.find({
    $or:[
      {owner: req.user._id},
      {members: {$in: [req.user._id]}}
    ]
  })
  .populate('owner', 'name email')
  .populate('members', 'name email')

  if(!boards)
    throw new Error("No Boards for you", {cause: 404});

  return res.status(200).json({message: 'success', countOfBoards: boards.length, boards})
}

//GET ONE BOARD
export const getBoard = async(req, res, next) =>{
  const {id} = req.params
  const board = await boardModel.findById(id).populate('members', 'name -_id')

  if(!board)
    throw new Error("Board Not Found", {cause:404});

  const isOwner = board.owner.toString() == req.user._id
  const isMember = board.members.some(m => m.toString() == req.user._id)

  if(!isMember && !isOwner)
    throw new Error("You Are Not Allowed To View This Board", {cause: 403});

  return res.status(200).json({message: 'Success', board})
    
}

//ADD MEMBER TO THE BOARD
export const addMember = async(req, res, next) =>{
  const {userId} = req.body
  const {id} = req.params

  const board = await boardModel.findById(id)
  if(!board)
    throw new Error("No Board Found", {cause: 404});

  if(board.owner.toString() !== req.user._id.toString())
    throw new Error("Only Board Owner Can Add Members", {cause: 403});

  if(!await userModel.findById(userId))
    throw new Error("User Not Found", {cause: 404});

  if(board.members.includes(userId))
    throw new Error("User Already a Member", {cause: 400});

  board.members.push(userId)
  await board.save()

  return res.status(201).json({message: 'Member Added Successfully', board})
}

//REMOVE MEMBER FROM A BOARD
export const removeMember = async(req, res, next) =>{
  const {id, userId} = req.params

  const board = await boardModel.findById(id)
  if(!board)
    throw new Error("Board Not Found", {cause: 404});

  if(board.owner.toString() !== req.user._id.toString())
    throw new Error("Only Owner Can Remove Members", {cause: 403});

  if(!await userModel.findById(userId))
    throw new Error("User Not Found", {cause: 404});

  if(!board.members.includes(userId))
    throw new Error("User Not in this board", {cause: 404});

  board.members.remove(userId)
  await board.save()

  return res.status(200).json({message: 'Member removed successfully', board})
    
}

//DELETE A BOARD
export const deleteBoard = async(req, res, next) =>{
  const {id} = req.params

  const board = await boardModel.findById(id)
  if(!board)
    throw new Error("Board Not Found", {cause: 404});

  const isOwner = board.owner.toString() == req.user._id.toString()
  if(!isOwner && req.user.role !== userRole.admin)
    throw new Error("You Are not allowed to delete this board", {cause: 403});

  const deletedBoard = await boardModel.findByIdAndDelete(id)

  return res.status(200).json({message: 'Board deleted successfully', board})
    
}