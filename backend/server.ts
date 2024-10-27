import 'dotenv/config'

import express from "express"
import methodOverride from "method-override"
import helmet from "helmet"
import cors from 'cors'

const app = express()

import loginRouter from "./routes/login"
import registerRouter from "./routes/register"
import dashboardRouter from "./routes/dashboard"
import blackboardRouter from "./routes/blackboard"

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(methodOverride("_method"))
app.use(cors())
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src-attr": ["'self'", "'unsafe-inline'", "default-src"],
    },
  },
}))

const version = "/v" + process.env.VERSION

app.use(version + "/login", loginRouter)
app.use(version + "/register", registerRouter)
app.use(version + "/dashboard", dashboardRouter)
app.use(version + "/blackboard", blackboardRouter)

app.listen(process.env.PORT)
console.log("[server] listening on port " + process.env.PORT)