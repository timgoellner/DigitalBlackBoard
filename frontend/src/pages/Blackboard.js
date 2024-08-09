import { useNavigate, useLoaderData } from 'react-router-dom';
import { useState, useMemo } from 'react';

import "../styles/Blackboard.css"

function Blackboard() {
  const [blackboard, setBlackboard] = useState()
  const [student, setStudent] = useState()

  const navigate = useNavigate()
  const user = useLoaderData()
  const token = localStorage.getItem('jwt-token')

  const refresh = () => {
    fetch(`http://localhost:100/blackboard/${user.organization}/${user.identifier}`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var blackboardData = data.blackboardData


        blackboardData = blackboardData.map((class_) => {
          return (
            <p key={class_.id}>{class_.name}</p>
          )
        })

        setBlackboard(blackboardData)
        setStudent(data.student)
      })
  }

  useMemo(refresh, [])

  function logout() {
    localStorage.removeItem('jwt-token')
    navigate('/login')
  }

  return (
    <>
      <div className='blackboard'>
        <header>
          <p>{user.organization}</p>
          <h1>Blackboard</h1>
          <button onClick={() => logout()}>Logout</button>
        </header>
        <main className='content'>
         <p>{student.forename} {student.lastname}</p> 
          {blackboard}
        </main>
      </div>
    </>
  )
}

export default Blackboard;
