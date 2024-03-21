import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
// import Product from './Product'
import 'bootstrap/dist/css/bootstrap.min.css'
// import Image from './Image'

// import Example from './Example'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <div className='d-flex'>
      <App />
      {/* <Product /> */}
      {/* <Image /> */}
    </div>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
