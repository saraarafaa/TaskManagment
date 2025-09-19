import express from 'express'
const app = express()
const port = process.env.PORT || 5000
import cors  from 'cors'
import helmet from 'helmet'
import {rateLimit} from 'express-rate-limit'
import { checkConnectionDB } from "./DB/connectionDB.js"
import { globalErrorHandling } from "./middleware/globalErrorHandling.js"
import boardRouter from "./modules/boards/board.controller.js"
import taskRouter from "./modules/tasks/tasks.controller.js"
import userRouter from "./modules/users/user.controller.js"

var whitelist = [process.env.FRONT_END, undefined]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    } 
  }
}

const bootstrap = () =>{
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.'
    },
    statusCode: 429
  })

  app.use(express.json())
  checkConnectionDB()

  app.use(cors(corsOptions))
  app.use(helmet())
  app.use(limiter)

  app.use('/users', userRouter)
  app.use('/board', boardRouter)
  app.use('/tasks', taskRouter)


  app.get('/', (req, res, next) =>{
    return res.status(200).json({message: 'Welcome to my Task Managment App 😃'})
  })

  app.use('{/*demo}', (req, res, next) =>{
    throw new Error(`URL NOT FOUND ${req.originalUrl}`);
  })
  
  app.use(globalErrorHandling)

  app.listen(port, () => console.log(`Task app listening on port ${port}!`))

}

export default bootstrap