import express from 'express'
import * as User from '../models/UserSchema'

export const postUser = async (req: express.Request, res: express.Response) => {
  const user = await User.create(req.body)
  res.status(201)
  res.json(user)
}

export const getUser = async (req: express.Request, res: express.Response) => {
  const user = await User.findOne(req.params.id)

  console.log('result', user)

  res.status(200)
  res.json(user)
}