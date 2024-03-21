import React, { useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB3KiTZGa5Qpq54gZYHyPVNID_G0y6M0Yk',
  authDomain: 'quikflo-64d8b.firebaseapp.com',
  projectId: 'quikflo-64d8b',
  storageBucket: 'quikflo-64d8b.appspot.com',
  messagingSenderId: '172899289931',
  appId: '1:172899289931:web:10223847c82ba5b5edb6ce',
  measurementId: 'G-KY2KTP6V9W',
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const storage = getStorage(firebaseApp)

const ImageUpload = () => {
  const [image, setImage] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleUpload = () => {
    const storageRef = ref(storage, `images/${image.name}`)
    const uploadTask = uploadBytesResumable(storageRef, image)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        setProgress(progress)
      },
      (error) => {
        console.error(error.message)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('File available at', url)
          // You can save the URL to a database or use it as needed
        })
      }
    )
  }

  return (
    <div>
      <input type='file' onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
      <progress value={progress} max='100' />
    </div>
  )
}

const App = () => {
  return (
    <div>
      <h1>Image Upload with Firebase</h1>
      <ImageUpload />
    </div>
  )
}

export default App
