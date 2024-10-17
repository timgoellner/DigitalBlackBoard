import express from 'express'
import { ResultSetHeader, RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const subjectsData = await sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)}`) as RowDataPacket[]

  const subjects: string[] = []
  subjectsData.forEach((subject) => subjects.push(subject.name));

  return response.status(200).json({ message: 'success', subjects })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { subject } = request.body
  subject = subject?.toLowerCase()

  if (subject.length > 45 || subject.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  await sendQuery(`INSERT INTO subjects (organization, name) VALUES (${escape(user.organization)}, ${escape(subject)})`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { subject } = request.body

  const deletion = await sendQuery(`DELETE FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(subject)}`) as ResultSetHeader
  if (deletion.affectedRows === 0) return response.status(401).json({ message: 'subject does not exist' })

  return response.status(200).json({ message: 'success' })
})

export default router