import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

// Validate video duration
export async function validateVideoDuration(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = video.duration
      resolve(duration <= 60) // Max 60 seconds
    }
    
    video.onerror = () => {
      resolve(false)
    }
    
    video.src = URL.createObjectURL(file)
  })
}

// Validate file size
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// Upload file to Firebase Storage
export async function uploadFile(file: File, ticketId: string): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `tickets/${ticketId}/${timestamp}.${extension}`
    
    // Create storage reference
    const storageRef = ref(storage, filename)
    
    // Upload file
    await uploadBytes(storageRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}

// Delete file from Firebase Storage
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, fileUrl)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}
