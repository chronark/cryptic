import { Client, Create, Collection } from "faunadb"

import { NextApiRequest, NextApiResponse } from "next"

const client = new Client({
  secret: process.env.FAUNADB_SECRET,
})

export default async function write(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const { content, remainingViews } = req.body
    if (!content) {
      throw new Error("No content found")
    }
    if (!remainingViews) {
      throw new Error("No remainingViews found")
    }

    const faunaResponse = (await client.query(
      Create(Collection("documents"), {
        data: {
          content,
          remainingViews: remainingViews,
        },
      }),
    )) as { ref: { id: string } }
    res.json({ id: faunaResponse.ref.id })
    res.status(200)
  } catch (err) {
    console.error(err)
    res.status(500)
    res.send(err.message)
  } finally {
    res.end()
  }
}
