import { Client, Update, Collection, Get, Ref, Delete } from "faunadb"

import { NextApiRequest, NextApiResponse } from "next"

const client = new Client({
  secret: process.env.FAUNADB_SECRET,
})

export default async function read(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const id = req.query.id

    if (!id) {
      throw new Error("id not found")
    }

    const documentRef = Ref(Collection("documents"), id)
    const document = (await client.query(Get(documentRef)).catch((err) => {
      throw new Error(`Unable to load document with id: ${id}: ${err.message}`)
    })) as { data: { _id: string; content: string; remainingViews: number } }

    if (document.data.remainingViews <= 1) {
      await client.query(Delete(documentRef))
    } else {
      await client.query(Update(documentRef, { data: { remainingViews: document.data.remainingViews - 1 } }))
    }
    console.log({ document })
    if (document.data.remainingViews >= 1) {
      res.json({
        content: document.data.content,
        remainingViews: document.data.remainingViews - 1,
      })
    } else {
      res.json({ err: "no reads left" })
    }

    res.status(200)
  } catch (err) {
    console.error(err)
    res.status(500)
    res.send(err.message)
  } finally {
    res.end()
  }
}
