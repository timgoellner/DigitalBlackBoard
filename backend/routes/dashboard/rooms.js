const express = require('express')
const escape = require("mysql2").escape

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

router.get("/", async (request, response) => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const roomsData = await mysql.sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)}`)

  const rooms = []
  roomsData.forEach(room => rooms.push(room.name));

  return response.status(200).json({ message: 'success', rooms })
})

router.post("/", async (request, response) => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { room } = request.body

  if (room.length > 45 || room.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  await mysql.sendQuery(`INSERT INTO rooms (organization, name) VALUES (${escape(user.organization)}, ${escape(room)})`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request, response) => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { room } = request.body

  const existing = await mysql.sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(room)}`)
  if (existing.length === 0) return response.status(401).json({ message: 'room does not exist' })

  await mysql.sendQuery(`DELETE FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(room)}`)
  
  return response.status(200).json({ message: 'success' })
})

module.exports = router