if (process.env.NODE_ENV !== "production") { require("dotenv").config() }

const express = require("express")
const methodOverride = require("method-override")
const helmet = require("helmet")
const cors = require('cors')

const app = express()

const loginRouter = require("./routes/login")
const registerRouter = require("./routes/register")

// Global Middleware
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

// Routes
app.use("/login", loginRouter)
app.use("/register", registerRouter)

app.listen(process.env.PORT)
console.log("[server] listening on port " + process.env.PORT)