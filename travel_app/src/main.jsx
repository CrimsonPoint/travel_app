import {createRoot} from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router-dom";
import router from './router';
import {ContextProvider} from "./contexts/ContextProvider.jsx";
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
    <ContextProvider>
      <Toaster position="top-center" />
      <RouterProvider router={router}/>
    </ContextProvider>
)
