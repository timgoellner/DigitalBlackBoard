import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('jwt-token')
    navigate('/login')
  }

  return (
    <>
      <main style={{ padding: '50px' }}>
        <h1>Dashboard</h1>
        <p>
          dashboard
        </p>
        <button onClick={logout}>Logout</button>
      </main>
    </>
  )
}

export default Dashboard;
