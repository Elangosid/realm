import React, { useState, useEffect } from 'react'
import * as Realm from 'realm-web'

const REALM_APP_ID = 'application-1-zyzrj' // Replace with your Realm App ID
const app = new Realm.App({ id: REALM_APP_ID })

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationSid, setVerificationSid] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [manufactures, setManufactures] = useState([])
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')

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
        .db('QUIK_FLO')
        .collection('manufactures')

      const data = await manufacturesCollection.find({})
      setManufactures(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    try {
      const user = app.currentUser

      // Use Twilio function to send OTP
      const response = await fetch(
        `https://YOUR_TWILIO_FUNCTION_URL/sendOTP?phoneNumber=${phoneNumber}`,
        { method: 'POST' }
      )

      const result = await response.json()
      setVerificationSid(result.sid)
      setIsVerified(false)
    } catch (error) {
      console.error('Error sending OTP:', error)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    try {
      const user = app.currentUser

      // Use Twilio function to verify OTP
      const response = await fetch(
        `https://YOUR_TWILIO_FUNCTION_URL/verifyOTP?verificationSid=${verificationSid}&otp=${otp}`,
        { method: 'POST' }
      )

      const result = await response.json()
      if (result.success) {
        setIsVerified(true)

        // Continue with your data insertion logic if verification is successful
        const manufacturesCollection = user
          .mongoClient('mongodb-atlas')
          .db('QUIK_FLO')
          .collection('manufactures')

        await manufacturesCollection.insertOne({ name, mobile })
        setName('')
        setMobile('')
        fetchData()
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
    }
  }

  return (
    <div className='App'>
      <div className='App-header'>
        {!isVerified ? (
          <form onSubmit={handleSendOTP}>
            <label>
              Phone Number:
              <input
                type='text'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </label>
            <br />
            <button type='submit'>Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <label>
              OTP:
              <input
                type='text'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </label>
            <br />
            <button type='submit'>Verify OTP</button>
          </form>
        )}

        <ul>
          {manufactures.map((manufacture) => (
            <li key={manufacture._id}>
              Name: {manufacture.name}, Mobile: {manufacture.mobile}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
