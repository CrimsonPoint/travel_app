import {createBrowserRouter, Navigate} from "react-router-dom";
import Login from "./views/Login.jsx";
import SignUp from "./views/SignUp.jsx";
import Users from "./views/Users.jsx";
import NotFoundPage from "./views/NotFoundPage.jsx";
import DefaultLayout from "./components/DefaultLayout.jsx";
import GuestLayout from "./components/GuestLayout.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Home from "./views/Home.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout/>,
    children: [
      {
        path: "/",
        element: <Navigate to="/users"/>,
      },
      {
        path: "/users",
        element: <Users/>
      },
      {
        path: "/dashboard",
        element: <Dashboard/>
      },
      {
        path: "/home",
        element: <Home/>,
      },
    ]
  },
  {
    path: "/",
    element: <GuestLayout/>,
    children: [
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/signup",
        element: <SignUp/>
      },
    ]
  },
  {
    path: "*",
    element: <NotFoundPage/>
  },
]);
export default router;
