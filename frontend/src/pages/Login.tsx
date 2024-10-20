import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { IoIosArrowForward } from "react-icons/io";

import "../styles/Login.css"

function Login() {
  const [organization, setOrganization] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const [errorUser, setErrorUser] = useState('')
  const [errorStaff, setErrorStaff] = useState('')
  var isStaff = false;

  const navigate = useNavigate();

  function submitUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const userType = (isStaff) ? ('staff') : ('user')

    fetch(`https://dbb.timgöllner.de/api/login?type=${userType}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ organization, identifier, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'valid') {
          localStorage.setItem('jwt-token', data.token)
          setOrganization('')
          setIdentifier('')
          setPassword('')

          if (isStaff) navigate('/dashboard')
          else navigate('/blackboard')
        } else {
          if (isStaff) setErrorStaff(data.message)
          else setErrorUser(data.message)
        }
      })
  }

  function toggleLogin() {
    document.getElementsByClassName('switch')[0].classList.toggle('clicked')
    document.getElementsByClassName('forms')[0].classList.toggle('clicked')

    setErrorUser('')
    setErrorStaff('')
  }

  return (
    <main className='login'>
      <div className='heading'>
        <p>Digital</p>
        <p>Black</p>
        <p>Board</p>
        <h1>Login</h1>
      </div>
      <div className='switch' onClick={() => { toggleLogin() }}>
        <IoIosArrowForward />
      </div>
      <div className='forms'>
        <form onSubmit={(event) => {
          isStaff = false
          submitUser(event);
        }}>
          <h2>User Login</h2>
          <input
            value={organization}
            type="text"
            placeholder="Organization"
            onChange={(e) => setOrganization(e.target.value)}
          />

          <input
            value={identifier}
            type="text"
            placeholder="Identifier"
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <button type="submit">Login</button>
          <p className='error'>{errorUser}</p>
        </form>

        <div className='gap'></div>

        <form onSubmit={(event) => {
          isStaff = true
          submitUser(event);
        }}>
          <h2>Staff Login</h2>
          <input
            value={organization}
            type="text"
            placeholder="Organization"
            onChange={(e) => setOrganization(e.target.value)}
          />

          <input
            value={identifier}
            type="text"
            placeholder="Identifier"
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <input
            value={password}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
          <p className='error'>{errorStaff}</p>
        </form>
      </div>
      <button onClick={ () => { navigate('/register') } } className='new-organization'>Register organization</button>
    </main>
  );
}

export default Login;
