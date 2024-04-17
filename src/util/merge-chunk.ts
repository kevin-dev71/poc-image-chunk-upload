import fs from "fs"
import { tmpdir } from "os"
import path from "path"

export const mergeChunks = async (fileName: string, totalChunks: number) => {
  const dirName = tmpdir()
  const chunkDir = path.join(dirName, "chunks")
  const mergedFilePath = path.join(dirName, "merged_files")

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath, { recursive: true })
  }

  const writeStream = fs.createWriteStream(path.join(mergedFilePath, fileName))
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = path.join(chunkDir, `${fileName}.part${i}`)
    const chunkBuffer = await fs.promises.readFile(chunkFilePath)
    writeStream.write(chunkBuffer)
    fs.unlinkSync(chunkFilePath) // Delete the individual chunk file after merging
  }

  writeStream.end()
  console.log("Chunks merged successfully")
}
