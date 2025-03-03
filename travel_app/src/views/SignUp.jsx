import {Link} from "react-router-dom";
import {useRef, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";

export default function SignUp() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const [errors, setErrors] = useState(null);

  const {setUser, setToken} = useStateContext();

  const onSubmit = (ev) => {
    ev.preventDefault();

    const data = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: confirmPasswordRef.current.value,
    }

    axiosClient.post("/signup", data)
      .then(({data}) => {
        setErrors(null)
        setUser(data.user);
        setToken(data.token);
      })
      .catch(err => {
        /* TODO Сделать корректную обработку ошибок, подкрутить UI */
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
            Зарегистрируйте свой аккаунт
          </h1>
          {
            errors && <div className="alert alert-danger">
              {Object.keys(errors).map(key => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
          }
          <input ref={nameRef} placeholder="Имя" type="Text"/>
          <input ref={emailRef} placeholder="Почта" type="email"/>
          <input ref={passwordRef} placeholder="Пароль" type="password"/>
          <input ref={confirmPasswordRef} placeholder="Повторите пароль" type="password"/>
          <button className="btn btn-block">Зарегистрироваться</button>
          <p className="message">
            Вы уже зарегистрированы, <Link to="/login">войти?</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
