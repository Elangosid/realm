import React, { useState, useEffect } from 'react'
import * as Realm from 'realm-web'
import { initializeApp } from 'firebase/app'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'

// your Realm App ID
const REALM_APP_ID = 'application-1-zyzrj'

// Initialize a Realm App instance with your App ID
const app = new Realm.App({ id: REALM_APP_ID })

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

const App = () => {
  const [formData, setFormData] = useState({
    Type: '',
    MobileNo: '',
    FullName: '',
    DOB: '',
    BusinessName: '',
    Email: '', // Add Email field
    KYC: {
      AlternativeNumber: '',
      PanNumber: '',
      AadhaarNumber: '',
      AadhaarName: '',
    },
    Image: '', // Add ImageURL field
  })

  const [manufactures, setManufactures] = useState([])
  const [selectedManufacture, setSelectedManufacture] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const user = app.currentUser
      if (!user) {
        await app.logIn(Realm.Credentials.anonymous())
      }

      const manufacturesCollection = user
        .mongoClient('mongodb-atlas')
        .db('QUIKFLO')
        .collection('Manufacture')

      const data = await manufacturesCollection.find({})

      setManufactures(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = app.currentUser

      const manufacturesCollection = user
        .mongoClient('mongodb-atlas')
        .db('QUIKFLO')
        .collection('Manufacture')

      const dobTimestamp = formData.DOB
        ? new Date(formData.DOB).toISOString()
        : null

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `images/${formData.Type}-${Date.now()}`)
      const uploadTask = uploadBytesResumable(storageRef, formData.Image)

      const uploadSnapshot = await uploadTask

      // Get the image download URL
      const imageURL = await getDownloadURL(uploadSnapshot.ref)

      // Insert data into Realm with the image URL
      await manufacturesCollection.insertOne({
        Type: formData.Type,
        MobileNo: formData.MobileNo,
        FullName: formData.FullName,
        DOB: dobTimestamp,
        BusinessName: formData.BusinessName,
        Email: formData.Email,
        KYC: {
          AlternativeNumber: formData.KYC.AlternativeNumber,
          PanNumber: formData.KYC.PanNumber,
          AadhaarNumber: formData.KYC.AadhaarNumber,
          AadhaarName: formData.KYC.AadhaarName,
        },
        Image: imageURL,
      })

      setFormData({
        Type: '',
        MobileNo: '',
        FullName: '',
        DOB: '',
        BusinessName: '',
        Email: '',

        Image: null, // Clear the image after upload
      })
      fetchData()
    } catch (error) {
      console.error('Error submitting form data:', error)
    }
  }

  const handleUpdate = (manufacture) => {
    setSelectedManufacture(manufacture)
    setFormData({
      Type: manufacture.Type,
      MobileNo: manufacture.Mobile,
      DOB: manufacture.DOB
        ? new Date(manufacture.DOB).toISOString().split('T')[0]
        : '',
      BusinessName: manufacture.BusinessName || '',
      Email: manufacture.Email || '',
      KYC: {
        AlternativeNumber: manufacture.KYC.AlternativeNumber || '',
        PanNumber: manufacture.KYC.PanNumber || '',
        AadhaarNumber: manufacture.KYC.AadhaarNumber || '',
        AadhaarName: manufacture.KYC.AadhaarName || '',
      },
    })
  }

  const handleUpdateFormSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = app.currentUser

      const manufacturesCollection = user
        .mongoClient('mongodb-atlas')
        .db('QUIKFLO')
        .collection('Manufacture')

      const dobTimestamp = formData.DOB
        ? new Date(formData.DOB).toISOString()
        : null

      await manufacturesCollection.updateOne(
        { _id: selectedManufacture._id },
        {
          $set: {
            Type: formData.Type,
            MobileNo: formData.MobileNo,
            FullName: formData.FullName,
            DOB: dobTimestamp,
            BusinessName: formData.BusinessName,
            Email: formData.Email,
            'KYC.AlternativeNumber': formData.KYC.AlternativeNumber,
            'KYC.PanNumber': formData.KYC.PanNumber,
            'KYC.AadhaarNumber': formData.KYC.AadhaarNumber,
            'KYC.AadhaarName': formData.KYC.AadhaarName,
          },
        }
      )

      setSelectedManufacture(null)
      setFormData({
        Type: '',
        MobileNo: '',
        FullName: '',
        DOB: '',
        BusinessName: '',
        Email: '',
        KYC: {
          AlternativeNumber: '',
          PanNumber: '',
          AadhaarNumber: '',
          AadhaarName: '',
        },
      })
      fetchData()
    } catch (error) {
      console.error('Error updating manufacture:', error)
    }
  }
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, Image: e.target.files[0] })
    }
  }
  return (
    <div className='container mt-5'>
      <h1 className='mb-4'>Manufactures</h1>

      <form className='col-8' onSubmit={handleFormSubmit}>
        <div className='mb-3'>
          <div className='mb-3'>
            <label htmlFor='Image' className='form-label'>
              Image:
            </label>
            <input
              type='file'
              id='Image'
              className='form-control'
              onChange={handleImageChange}
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='AlternativeNumber' className='form-label'>
              Alternative Number:
            </label>
            <input
              type='text'
              id='AlternativeNumber'
              className='form-control'
              value={formData.KYC.AlternativeNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  KYC: {
                    ...formData.KYC,
                    AlternativeNumber: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='PanNumber' className='form-label'>
              Pan Number:
            </label>
            <input
              type='text'
              id='PanNumber'
              className='form-control'
              value={formData.KYC.PanNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  KYC: {
                    ...formData.KYC,
                    PanNumber: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='AadhaarNumber' className='form-label'>
              Aadhaar Number:
            </label>
            <input
              type='text'
              id='AadhaarNumber'
              className='form-control'
              value={formData.KYC.AadhaarNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  KYC: {
                    ...formData.KYC,
                    AadhaarNumber: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='AadhaarName' className='form-label'>
              Aadhaar Name:
            </label>
            <input
              type='text'
              id='AadhaarName'
              className='form-control'
              value={formData.KYC.AadhaarName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  KYC: {
                    ...formData.KYC,
                    AadhaarName: e.target.value,
                  },
                })
              }
            />
          </div>

          <label htmlFor='Type' className='form-label'>
            Type:
          </label>
          <input
            type='text'
            id='Type'
            className='form-control'
            value={formData.Type}
            onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
          />
        </div>

        <div className='mb-3'>
          <label htmlFor='MobileNo' className='form-label'>
            Mobile Number:
          </label>
          <input
            type='text'
            id='MobileNo'
            className='form-control'
            value={formData.MobileNo}
            onChange={(e) =>
              setFormData({ ...formData, MobileNo: e.target.value })
            }
          />
        </div>

        <div className='mb-3'>
          <label htmlFor='FullName'>Full Name</label>
          <input
            type='text'
            id='FullName'
            className='form-control'
            value={formData.FullName}
            onChange={(e) =>
              setFormData({ ...formData, FullName: e.target.value })
            }
          />
        </div>

        <div className='mb-3'>
          <label htmlFor='DOB' className='form-label'>
            Date of Birth:
          </label>
          <input
            type='date'
            id='DOB'
            className='form-control'
            value={formData.DOB}
            onChange={(e) => setFormData({ ...formData, DOB: e.target.value })}
          />
        </div>

        <div className='mb-3'>
          <label htmlFor='BusinessName' className='form-label'>
            Business Name:
          </label>
          <input
            type='text'
            id='BusinessName'
            className='form-control'
            value={formData.BusinessName}
            onChange={(e) =>
              setFormData({ ...formData, BusinessName: e.target.value })
            }
          />
        </div>

        <div className='mb-3'>
          <label htmlFor='Email' className='form-label'>
            Email:
          </label>
          <input
            type='email'
            id='Email'
            className='form-control'
            value={formData.Email}
            onChange={(e) =>
              setFormData({ ...formData, Email: e.target.value })
            }
          />
        </div>

        <button type='submit' className='btn btn-primary'>
          Submit
        </button>
      </form>

      <ul className='list-group mt-4 col-6'>
        {manufactures.map((manufacture) => (
          <li key={manufacture._id} className='list-group-item'>
            Type: {manufacture.Type}, Mobile: {manufacture.MobileNo}, DOB:{' '}
            {manufacture.DOB
              ? new Date(manufacture.DOB).toLocaleDateString()
              : 'N/A'}
            , BusinessName: {manufacture.BusinessName || 'N/A'}, Email:{' '}
            {manufacture.Email || 'N/A'}
            {manufacture.Image && (
              <div>
                <img
                  src={manufacture.Image}
                  alt='Manufacture'
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </div>
            )}
            <button
              onClick={() => handleUpdate(manufacture)}
              className='btn btn-warning btn-sm mx-2'
            >
              Update
            </button>
          </li>
        ))}
      </ul>

      {selectedManufacture && (
        <form onSubmit={handleUpdateFormSubmit} className='mt-4'>
          <div className='mb-3'>
            <label htmlFor='updateType' className='form-label'>
              Type:
            </label>
            <input
              type='text'
              id='updateType'
              className='form-control'
              value={formData.Type}
              onChange={(e) =>
                setFormData({ ...formData, Type: e.target.value })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='updateMobile' className='form-label'>
              Mobile Number:
            </label>
            <input
              type='text'
              id='updateMobile'
              className='form-control'
              value={formData.MobileNo}
              onChange={(e) =>
                setFormData({ ...formData, MobileNo: e.target.value })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='updateDOB' className='form-label'>
              Date of Birth:
            </label>
            <input
              type='date'
              id='updateDOB'
              className='form-control'
              value={formData.DOB}
              onChange={(e) =>
                setFormData({ ...formData, DOB: e.target.value })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='updateBusinessName' className='form-label'>
              Business Name:
            </label>
            <input
              type='text'
              id='updateBusinessName'
              className='form-control'
              value={formData.BusinessName}
              onChange={(e) =>
                setFormData({ ...formData, BusinessName: e.target.value })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='updateEmail' className='form-label'>
              Email:
            </label>
            <input
              type='email'
              id='updateEmail'
              className='form-control'
              value={formData.Email}
              onChange={(e) =>
                setFormData({ ...formData, Email: e.target.value })
              }
            />
          </div>

          <button type='submit' className='btn btn-success'>
            Update
          </button>
        </form>
      )}
    </div>
  )
}

export default App
