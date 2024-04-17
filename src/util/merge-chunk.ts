import fs from "fs"
import path from "path"

export const mergeChunks = async (fileName: string, totalChunks: number) => {
  const chunkDir = path.join(process.cwd(), "src", "uploads", "chunk")
  const mergedFilePath = path.join(process.cwd(), "src", "uploads", "merged_files")

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
