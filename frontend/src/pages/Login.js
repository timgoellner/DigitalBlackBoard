import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Login() {
  const [organization, setOrganization] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  var isStaff = false;

  const navigate = useNavigate();

  function submitUser(event) {
    event.preventDefault()

    const userType = (isStaff) ? ('staff') : ('user')
    fetch(`http://localhost:100/login?type=${userType}`, {
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
          alert(data.message)
        }
      })
  }

  return (
    <main>
      <form onSubmit={(event) => {
        isStaff = false
        submitUser(event);
      }}>
        <input
          value={organization}
          type="text"
          placeholder="Organization"
          onChange={(e) => setOrganization(e.target.value)}
        />

        <input
          value={password}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      <form onSubmit={(event) => {
        isStaff = true
        submitUser(event);
      }}>
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
      </form>
    </main>
  );
}

export default Login;
