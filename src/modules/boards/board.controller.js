import * as BV from "./board.validation.js"
import * as BS from "./board.service.js"
import { Router } from "express"
import { authentication } from "../../middleware/authentication.js"
import { validation } from "../../middleware/validation.js"

const boardRouter = Router()

boardRouter.post('/create', authentication, validation(BV.createBoardSchema), BS.createBoard)
boardRouter.get('/getBoards', authentication, BS.getMyBoards)
boardRouter.get('/getBoard/:id', authentication, validation(BV.getBoardSchema), BS.getBoard)
boardRouter.delete('/removeMember/:id/:userId', authentication, validation(BV.removeMemberSchema), BS.removeMember)
boardRouter.post('/addMember/:id', authentication, validation(BV.addMemberSchema), BS.addMember)
boardRouter.delete('/deleteBoard/:id', authentication, validation(BV.deleteBoardSchema), BS.deleteBoard)

export default boardRouter