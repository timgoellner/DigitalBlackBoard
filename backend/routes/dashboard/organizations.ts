import express from 'express'
import { RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const organizationData = await sendQuery(`SELECT * FROM organizations WHERE name = ${escape(user.organization)}`) as RowDataPacket[]
  if (organizationData.length === 0) return response.status(409).json({ message: 'organization does not exist' })
  const organization = organizationData[0]
  
  return response.status(200).json({ message: 'success', organization })
})

router.put("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { news, quarantine } = request.body
  if (quarantine === null) quarantine = false

  await sendQuery(`UPDATE organizations SET news = ${escape(news)}, quarantine = ${escape(quarantine ? 1 : 0)} WHERE name = ${escape(user.organization)}`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  await sendQuery(`DELETE FROM organizations WHERE name = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM student_classes WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM teacher_subjects WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM changes WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM classes WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM students WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM teachers WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM grades WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM accounts WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM subjects WHERE organization = ${escape(user.organization)}`)
  await sendQuery(`DELETE FROM rooms WHERE organization = ${escape(user.organization)}`)
  
  return response.status(200).json({ message: 'success' })
})

export default router