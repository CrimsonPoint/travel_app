import {Link} from "react-router-dom";
import {useRef} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";

export default function SignUp() {
  const nameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const {setUser, setToken} = useStateContext();

  function isValidPassword() {
    /*
    * TODO Написать сверку паролей при вводе
    * */
  }

  const onSubmit = (ev) => {
    ev.preventDefault();

    const data = {
      name: nameRef.current.value,
      lastName: lastNameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: confirmPasswordRef.current.value,
    }

    axiosClient.post("/signup", data)
      .then(({data}) => {
        setToken(data.token);
        setUser(data.user);
      })
      .catch(err => {
        const error = err.response;

        if(error.response && error.response.status === 403) {
          console.log(error.data.response);
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
          <input ref={nameRef} placeholder="Имя" type="Text"/>
          <input ref={lastNameRef} placeholder="Фамилия" type="Text"/>
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
