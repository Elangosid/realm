import React, { useState, useEffect } from 'react'
import * as Realm from 'realm-web'
import 'bootstrap/dist/css/bootstrap.min.css'

const REALM_APP_ID = 'application-1-zyzrj'
const app = new Realm.App({ id: REALM_APP_ID })

const App = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productName, setProductName] = useState('')
  const [productNumber, setProductNumber] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const user = app.currentUser
      if (!user) {
        await app.logIn(Realm.Credentials.anonymous())
      }

      const productsCollection = user
        .mongoClient('mongodb-atlas')
        .db('QUIK_FLO')
        .collection('products')

      const data = await productsCollection.find({})
      setProducts(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = app.currentUser
      const productsCollection = user
        .mongoClient('mongodb-atlas')
        .db('QUIK_FLO')
        .collection('products')

      await productsCollection.insertOne({ productName, productNumber })
      setProductName('')
      setProductNumber('')
      fetchData()
    } catch (error) {
      console.error('Error submitting form data:', error)
    }
  }

  const handleUpdate = (product) => {
    setSelectedProduct(product)
    setProductName(product.productName)
    setProductNumber(product.productNumber)
  }

  const handleUpdateFormSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = app.currentUser
      const productsCollection = user
        .mongoClient('mongodb-atlas')
        .db('QUIK_FLO')
        .collection('products')

      await productsCollection.updateOne(
        { _id: selectedProduct._id },
        { $set: { productName, productNumber } }
      )

      setSelectedProduct(null)
      setProductName('')
      setProductNumber('')
      fetchData()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDelete = async (productId) => {
    try {
      const user = app.currentUser
      const productsCollection = user
        .mongoClient('mongodb-atlas')
        .db('QUIK_FLO')
        .collection('products')

      await productsCollection.deleteOne({ _id: productId })
      fetchData()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  return (
    <div className='container mt-5'>
      <h1>Product Management</h1>
      <div className='App-header col-8'>
        <form onSubmit={handleFormSubmit}>
          <div className='mb-3'>
            <label htmlFor='productName' className='form-label'>
              Product Name:
            </label>
            <input
              type='text'
              id='productName'
              className='form-control'
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='productNumber' className='form-label'>
              Product Number:
            </label>
            <input
              type='text'
              id='productNumber'
              className='form-control'
              value={productNumber}
              onChange={(e) => setProductNumber(e.target.value)}
            />
          </div>
          <button type='submit' className='btn btn-primary'>
            Submit
          </button>
        </form>

        <ul className='list-group mt-4'>
          {products.map((product) => (
            <li key={product._id} className='list-group-item'>
              Product Name: {product.productName}, Product Number:{' '}
              {product.productNumber}
              <button
                onClick={() => handleUpdate(product)}
                className='btn btn-warning btn-sm mx-2'
              >
                Update
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className='btn btn-danger btn-sm'
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {selectedProduct && (
          <form onSubmit={handleUpdateFormSubmit} className='mt-4'>
            <div className='mb-3'>
              <label htmlFor='updateProductName' className='form-label'>
                Product Name:
              </label>
              <input
                type='text'
                id='updateProductName'
                className='form-control'
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className='mb-3'>
              <label htmlFor='updateProductNumber' className='form-label'>
                Product Number:
              </label>
              <input
                type='text'
                id='updateProductNumber'
                className='form-control'
                value={productNumber}
                onChange={(e) => setProductNumber(e.target.value)}
              />
            </div>
            <button type='submit' className='btn btn-success'>
              Update
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default App
