import mongoose from "mongoose";

const boardSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  owner:{
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true
  },
  members: [{
    type: mongoose.Types.ObjectId,
    ref: 'user'
  }]
})

const boardModel = mongoose.models.board || mongoose.model('board', boardSchema)

export default boardModel