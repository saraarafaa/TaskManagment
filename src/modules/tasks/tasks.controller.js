import * as TS from "./tasks.service.js";
import * as TV from "./tasks.validation.js";
import { authentication } from "../../middleware/authentication.js";
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { allowedExtension, MulterHost } from "../../middleware/Multer.js";

const taskRouter = Router()
taskRouter.post('/createTask/:boardId',
  authentication,
  MulterHost({customExtension: [...allowedExtension.image, ...allowedExtension.pdf]}).array('attachments'),
  validation(TV.createTaskSchema),
  TS.createTask)

taskRouter.get('/:boardId', authentication, validation(TV.getTasksSchema), TS.getTasks)
taskRouter.get('/:boardId/:id', authentication, validation(TV.findTaskSchema), TS.findTask)
taskRouter.patch('/update/:boardId/:id', authentication, validation(TV.updateTaskSchema), TS.updateTask)
taskRouter.delete('/delete/:boardId/:id', authentication, validation(TV.deleteTaskSchema), TS.deleteTask)

export default taskRouter