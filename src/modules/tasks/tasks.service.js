import boardModel from "../../DB/models/boardModel.js"
import taskModel from "../../DB/models/taskModel.js"
import cloudinary from "../../utils/cloudinary/index.js"


//CREATE A TASK
export const createTask = async(req, res, next) =>{
  const {title, description, status, priority, dueDate, createdBy, assignedTo} = req.body
  const {boardId} = req.params

  const arrPath = []
    for (const file of req?.files) {
      const {secure_url, public_id} = await cloudinary.uploader.upload(file?.path, {
        folder: 'TaskManagment/Tasks'
      })
      arrPath.push({secure_url, public_id})
    }
  
  const board = await boardModel.findById(boardId)
  if(!board)
    throw new Error("Board Not Found", {cause: 404});

  if(!board.members.includes(req?.user?._id.toString()))
    throw new Error("You cant't add task to this board", {cause: 403});

  const task = await taskModel.create({
    title,
    description,
    status,
    priority,
    dueDate,
    createdBy: req?.user?._id,
    assignedTo,
    attachments: arrPath,
    boardId
    })

  return res.status(201).json({message: 'Task created successfully', task})
}

//GET ALL TASKS OF A BOARD
export const getTasks = async(req, res, next) =>{
  const {boardId} = req.params

  const board = await boardModel.findById(boardId)
  if(!board)
    throw new Error("No Board Found", {cause: 404});

  if(!board.members.includes(req?.user?._id.toString()))
    throw new Error("You are not included in this board", {cause: 403});

  const tasks = await taskModel.find({boardId}).populate('createdBy', 'name email -_id')
  if(tasks.length == 0) throw new Error("No Tasks in this board", {cause: 404});
  
  return res.status(200).json({message: 'success', tasks})
}

//GET ONE TASK
export const findTask = async(req, res, next) =>{
  const {id, boardId} = req.params
  const board = await boardModel.findById(boardId)
  if(!board) throw new Error("Board Not Found", {cause: 404});

  if(!board.members.includes(req?.user?._id.toString()))
    throw new Error("You Are Not Included", {cause: 403});

  const task = await taskModel.findById(id).populate('createdBy', 'name email -_id')
  if(!task)
    throw new Error("Task Not Found", {cause: 404});

  return res.status(200).json({message: 'success', task})
}

//UPDATE TASK
export const updateTask = async(req, res, next) =>{
  const {boardId, id} = req.params
  const {title, description, status, priority, dueDate, assignedTo} = req.body
  const board = await boardModel.findById(boardId)
  if(!board) throw new Error("Board Not Found", {cause: 404});

  const task = await taskModel.findById(id)
  if(!task)
    throw new Error("Task Not Found", {cause: 404});

  if(board.owner.toString() !== req?.user?._id.toString() && task.createdBy.toString() !== req?.user?._id.toString())
    throw new Error("You Are Not Allowed to update", {cause: 403});

  if(title) task.title = title
  if(description) task.description = description
  if(status) task.status = status
  if(priority) task.priority = priority
  if(dueDate) task.dueDate = dueDate
  if(assignedTo) task.assignedTo = assignedTo

  await task.save()

  return res.status(200).json({message: 'Task updated', task})
}

//DELETE A TASK
export const deleteTask = async(req, res, next) =>{
  const {boardId, id} = req.params
  const board = await boardModel.findById(boardId)
  if(!board) throw new Error("Board Not Found", {cause: 404});

  const task = await taskModel.findById(id)
  if(!task)
    throw new Error("Task Not Found", {cause: 404});

  if(board.owner.toString() !== req?.user?._id.toString() && task.createdBy.toString() !== req?.user?._id.toString())
    throw new Error("You Are Not Allowed to delete", {cause: 403});

for (const file of task.attachments) {
  await cloudinary.uploader.destroy(file.public_id);
}
  await taskModel.findByIdAndDelete(id)


  return res.status(200).json({message: 'Task deleted', task})
}