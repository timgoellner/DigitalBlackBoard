import express from 'express'
import bcypt from 'bcrypt'
import { RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const accounts = await sendQuery(`SELECT * FROM accounts WHERE organization = ${escape(user.organization)} AND isStaff = 1`)

  return response.status(200).json({ message: 'success', accounts })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { identifier, password, confirmPassword } = request.body
  identifier = identifier?.toLowerCase()

  if (identifier.length > 45 || identifier.length === 0 || password.length === 0) return response.status(401).json({ message: 'invalid parameters' })
  if (password !== confirmPassword) return response.status(401).json({ message: 'passwords do not match' })

  const account = await sendQuery(`SELECT * FROM accounts WHERE organization = ${escape(user.organization)} AND identifier = ${escape(identifier)}`) as RowDataPacket[]
  if (account.length > 0) return response.status(401).json({ message: 'account already exists' })

  password = await bcypt.hash(password, 10)

  await sendQuery(`INSERT INTO accounts (organization, identifier, password, isStaff) VALUES (${escape(user.organization)}, ${escape(identifier)}, ${escape(password)}, 1)`)

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { id, password, confirmPassword } = request.body

  if (password.length === 0) return response.status(401).json({ message: 'invalid parameters' })
  if (password !== confirmPassword) return response.status(401).json({ message: 'passwords do not match' })

  const account = await sendQuery(`SELECT * FROM accounts WHERE organization = ${escape(user.organization)} AND id = ${escape(id)}`) as RowDataPacket[]
  if (account.length === 0) return response.status(401).json({ message: 'account does not exist' })

  password = await bcypt.hash(password, 10)

  await sendQuery(`UPDATE accounts SET password = ${escape(password)} WHERE organization = ${escape(user.organization)} AND id = ${escape(id)}`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { id, identifier } = request.body

  if (user.identifier === identifier) return response.status(401).json({ message: 'cannot delete current account' })

  const existing = await sendQuery(`SELECT * FROM accounts WHERE organization = ${escape(user.organization)} AND id = ${escape(id)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(401).json({ message: 'account does not exist' })

  await sendQuery(`DELETE FROM accounts WHERE organization = ${escape(user.organization)} AND id = ${escape(id)}`)
  
  return response.status(200).json({ message: 'success' })
})

export default router