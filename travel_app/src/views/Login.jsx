import {Link} from "react-router-dom";
import {useRef, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [errors, setErrors] = useState(null);

  const {setUser, setToken} = useStateContext();

  const onSubmit = (ev) => {
    ev.preventDefault();

    const data = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }

    axiosClient.post("/login", data)
      .then(({data}) => {
        setErrors(null)
        setUser(data.user);
        setToken(data.token);
      })
      .catch(err => {
        // TODO Тоже самое что в авторизации

        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors)
        }
      });
  }

  return (
    <div className="login-signup-form animated fadeInDown">
      <div className="form">
        <form onSubmit={onSubmit}>
          <h1 className="title">
            Войдите в свой аккаунт
          </h1>
          {
            errors && <div className="alert alert-danger">
              {Object.keys(errors).map(key => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
          }
          <input ref={emailRef} placeholder="Почта" type="email"/>
          <input ref={passwordRef} placeholder="Пароль" type="password"/>
          <button className="btn btn-block">Войти</button>
          <p className="message">
            Вы не зарегистрированы, <Link to="/signup">создать аккаунт</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
