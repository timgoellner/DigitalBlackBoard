import React, { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';

import "../styles/Login.css"

function Register() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [organization, setOrganization] = useState(searchParams.get('organization') === null ? '' : searchParams.get('organization') as string)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')

  const navigate = useNavigate();


  function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    fetch(`https://dbb.timgöllner.de/api/v1/register`, {
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

          navigate('/dashboard')
        } else {
          setError(data.message)
        }
      })
  }

  return (
    <main className='register'>
      <h1>Setup organisation admin account</h1>

      <form className='register-form' onSubmit={(event) => {
          submitUser(event);
        }}>
          <div>
            <p>Name of your organisation</p>
            <input
              value={organization}
              type="text"
              placeholder="Organization"
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>

          <div>
            <p>Admin account name</p>
            <input
              value={identifier}
              type="text"
              placeholder="Identifier"
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div>
            <p>Strong password</p>
            <input
              value={password}
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit">Register</button>
          <p className='error'>{error}</p>
        </form>
    </main>
  ) 
}

export default Register;