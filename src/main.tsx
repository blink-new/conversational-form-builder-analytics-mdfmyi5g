import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { FormProvider } from './context/FormContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FormProvider>
      <Toaster position="top-right" />
      <App />
    </FormProvider>
  </React.StrictMode>,
)