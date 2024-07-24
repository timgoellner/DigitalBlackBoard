import { useNavigate, useLoaderData } from 'react-router-dom';
import { useState } from 'react';

import "../styles/Dashboard.css"

import Home from '../components/Home';
import Grades from '../components/Grades';
import Teachers from '../components/Teachers';
import Students from '../components/Students';
import Classes from '../components/Classes';
import Changes from '../components/Changes';
import Users from '../components/Users';

function Dashboard() {
  const [page, setPage] = useState(0)

  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('jwt-token')
    navigate('/login')
  }

  function selectPage(pageId) {
    setPage(pageId)

    const childs = Array.from(document.getElementsByClassName('bar')[0].children).concat(Array.from(document.getElementsByClassName('bar')[1].children))
    for (var i = 0; i < childs.length; i++) {
      if (i === pageId) childs.at(i).classList.add('selected')
      else childs.at(i).classList.remove('selected')
    }
  }

  const user = useLoaderData()

  return (
    <main className='dashboard'>
      <div className='controll-section'>
        <h1>DBB Dashboard</h1>
        <div className='bars'>
          <div className='bar'>
            <div onClick={() => selectPage(0)} className='selected'>Home</div>
            <div onClick={() => selectPage(1)}>Grades</div>
            <div onClick={() => selectPage(2)}>Teachers</div>
            <div onClick={() => selectPage(3)}>Students</div>
            <div onClick={() => selectPage(4)}>Classes</div>
          </div>
          <hr />
          <div className='bar'>
            <div onClick={() => selectPage(5)}>Changes</div>
            <div onClick={() => selectPage(6)}>Users</div>
          </div>
          <hr />
          <div className='bar'>
            <div onClick={() => logout()}>Logout</div>
          </div>
        </div>
        <div className='info'>
          {user.identifier} @ {user.organization}
        </div>
      </div>

      <div>
        {
          (page === 0 && <Home />) ||
          (page === 1 && <Grades />) ||
          (page === 2 && <Teachers />) ||
          (page === 3 && <Students />) ||
          (page === 4 && <Classes />) ||
          (page === 5 && <Changes />) ||
          (page === 6 && <Users />)
        }
      </div>
    </main>
  )
}

export default Dashboard;
