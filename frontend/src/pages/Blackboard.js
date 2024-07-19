import { useNavigate } from 'react-router-dom';

function Blackboard() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('jwt-token')
    navigate('/login')
  }

  return (
    <>
      <main style={{ padding: '50px' }}>
        <h1>Blackboard</h1>
        <p>
          blackboard
        </p>
        <button onClick={logout}>Logout</button>
      </main>
    </>
  )
}

export default Blackboard;
