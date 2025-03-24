import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {RouterProvider} from "react-router-dom";
import router from './router';
import {ContextProvider} from "./contexts/ContextProvider.jsx";
import { Toaster, toast } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextProvider>
      <Toaster position="top-center" />
      <RouterProvider router={router}/>
    </ContextProvider>
  </StrictMode>,
)
