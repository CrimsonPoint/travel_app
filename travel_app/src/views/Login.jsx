import {Link} from "react-router-dom";

export default function Login() {

  const onSubmit = (ev) => {
    ev.preventDefault();
  }

  return (
    <div className="login-signup-form animated fadeInDown">
      <div className="form">
        <form onSubmit={onSubmit}>
          <h1 className="title">
            Войдите в свой аккаунт
          </h1>
          <input placeholder="Почта" type="email"/>
          <input placeholder="Пароль" type="password"/>
          <button className="btn btn-block">Войти</button>
          <p className="message">
            Вы не зарегистрированы, <Link to="/signup">создать аккаунт</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
