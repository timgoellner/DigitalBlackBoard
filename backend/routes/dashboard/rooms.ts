import express from 'express'
import { ResultSetHeader, RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const roomsData = await sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)}`) as RowDataPacket[]

  const rooms: string[] = []
  roomsData.forEach((room) => rooms.push(room.name));

  return response.status(200).json({ message: 'success', rooms })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { room } = request.body

  if (room.length > 45 || room.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  await sendQuery(`INSERT INTO rooms (organization, name) VALUES (${escape(user.organization)}, ${escape(room)})`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { room } = request.body

  const deletion = await sendQuery(`DELETE FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(room)}`) as ResultSetHeader
  if (deletion.affectedRows === 0) return response.status(401).json({ message: 'room does not exist' })
  
  return response.status(200).json({ message: 'success' })
})

export default router