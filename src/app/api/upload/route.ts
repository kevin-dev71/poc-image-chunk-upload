import fs from "fs"
import { tmpdir } from "os"
import path from "path"

import { mergeChunks } from "@/util/merge-chunk"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const chunk = formData.get("file") as File
    const chunkNumber = formData.get("chunkNumber") as string
    const totalChunks = formData.get("totalChunks") as string
    const fileName = (formData.get("originalname") as string).replaceAll(" ", "_")

    // HANDLE UNIQUE PATH TO PREVENT OVERWRITE IN CONCURRENCE
    const chunkDir = path.join(tmpdir(), "chunks")

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true })
    }

    const chunkFilePath = path.join(chunkDir, `${fileName}.part${chunkNumber}`)

    const buffer = Buffer.from(await chunk.arrayBuffer())

    await fs.promises.writeFile(chunkFilePath, buffer)
    console.log(`Chunk ${chunkNumber}/${totalChunks} saved`)

    if (Number(chunkNumber) === Number(totalChunks) - 1) {
      // If this is the last chunk, merge all chunks into a single file
      await mergeChunks(fileName, Number(totalChunks))
      console.log("File merged successfully")
      // UPLOAD THIS FILE TO A BUCKET
    }

    return Response.json({ message: "chunk uploaded" }, { status: 200 })
  } catch (error) {
    console.error("Error saving chunk:", error)
    return Response.json({ error: "Error saving chunk" }, { status: 500 })
  }
}
