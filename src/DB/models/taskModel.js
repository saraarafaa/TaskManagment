import mongoose from "mongoose";

export const taskStatus = {
  todo: 'todo',
  in_Progress: 'in_Progress',
  done: 'done'
}

export const taskPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high'
}

const taskSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(taskStatus),
    default: taskStatus.todo
  },
  priority:{
    type: String,
    enum: Object.values(taskPriority),
    default: taskPriority.medium
  },
  dueDate :{
    type: Date
  },
  attachments:[{
    secure_url: {type: String},
    public_id: {type: String}
  }],
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true
  },
  assignedTo:[{
    type: mongoose.Types.ObjectId,
    ref: 'user'
  }],
  boardId:{
    type: mongoose.Types.ObjectId,
    ref: 'board',
    required: true
  }
},
 {
  timestamps: true
 })

const taskModel = mongoose.models.task || mongoose.model('task', taskSchema)

export default taskModel