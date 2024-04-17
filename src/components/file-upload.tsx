"use client"

import { useState } from "react"

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState("")
  const [progress, setProgress] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload.")
      return
    }

    const chunkSize = 1 * 1024 * 1024 // 5MB (adjust based on your requirements)
    const totalChunks = Math.ceil(selectedFile.size / chunkSize)
    const chunkProgress = 100 / totalChunks
    let chunkNumber = 0
    let start = 0
    let end = 0

    const uploadNextChunk = async () => {
      console.log({ end, size: selectedFile.size })
      if (end <= selectedFile.size) {
        const chunk = selectedFile.slice(start, end)
        const formData = new FormData()
        formData.append("file", chunk)
        formData.append("chunkNumber", chunkNumber.toString())
        formData.append("totalChunks", totalChunks.toString())
        formData.append("originalname", selectedFile.name)

        fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log({ data })
            const temp = `Chunk ${chunkNumber + 1}/${totalChunks} uploaded successfully`
            setStatus(temp)
            setProgress(Number((chunkNumber + 1) * chunkProgress))
            console.log(temp)
            chunkNumber++
            start = end
            end = start + chunkSize
            uploadNextChunk()
          })
          .catch((error) => {
            console.error("Error uploading chunk:", error)
          })
      } else {
        setProgress(100)
        setSelectedFile(null)
        setStatus("File upload completed")
      }
    }

    uploadNextChunk()
  }

  return (
    <div>
      <h2>Resumable File Upload</h2>
      <h3>{status}</h3>
      {progress > 0 && <Progress value={progress} />}
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload File</button>
    </div>
  )
}

const Progress = ({ value }: { value: number }) => {
  return <progress value={value} max="100" />
}
