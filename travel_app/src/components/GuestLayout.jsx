import {Navigate, Outlet} from "react-router-dom";
import {useStateContext} from "../contexts/ContextProvider.jsx";

export default function GuestLayout (props) {
  const {token} = useStateContext()

  if(token){
    return <Navigate to="/"></Navigate>
  }

  return (
    <div>
      <Outlet />
    </div>
  )
}
