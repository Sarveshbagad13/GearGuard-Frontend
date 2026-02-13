import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import EquipmentPage from "./Pages/EquipmentPage.jsx"
import RequestPage from "./Pages/RequestPage.jsx"
import TeamPage from "./Pages/TeamPage.jsx"


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/equipment",
    element: <EquipmentPage />
  },
  {
    path: "/request",
    element: <RequestPage />
  },
  {
    path: "/team",
    element: <TeamPage />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
