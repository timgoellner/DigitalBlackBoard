import React from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { SetStateAction, useState } from 'react';

import { PiChalkboardTeacherFill, PiStudentFill } from "react-icons/pi";
import { FaPeopleLine } from "react-icons/fa6";
import { IoLayers, IoSettingsSharp } from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import "../styles/Dashboard.css"

import Grades from '../components/Grades';
import Teachers from '../components/Teachers';
import Students from '../components/Students';
import Classes from '../components/Classes';
import Changes from '../components/Changes';
import Settings from '../components/Settings';


type User = {
  signInTime: Date,
  organization: string,
  identifier: string,
  isStaff: boolean
}

function Dashboard() {
  const [page, setPage] = useState(0)

  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('jwt-token')
    navigate('/login')
  }

  function selectPage(pageId: SetStateAction<number>) {
    setPage(pageId)

    const childs = Array.from(document.getElementsByClassName('bar')[0].children).concat(Array.from(document.getElementsByClassName('bar')[1].children))

    for (var i = 0; i < childs.length; i++) {
      if (i === pageId) childs.at(i)?.classList.add('selected')
      else childs.at(i)?.classList.remove('selected')
    }
  }

  const user = useLoaderData() as User

  return (
    <div className='dashboard'>
      <div className='controll-section'>
        <div>
          <span>
            <p>Digital</p>
            <p>Black</p>
            <p>Board</p>
          </span>
          <h1> Dashboard</h1>
        </div>
        <div className='bars'>
          <div className='bar'>
            <div onClick={() => selectPage(0)} className='selected'><IoLayers /> Grades</div>
            <div onClick={() => selectPage(1)}><PiChalkboardTeacherFill /> Teachers</div>
            <div onClick={() => selectPage(2)}><PiStudentFill /> Students</div>
            <div onClick={() => selectPage(3)}><FaPeopleLine /> Classes</div>
          </div>
          <hr />
          <div className='bar'>
            <div onClick={() => selectPage(4)}><FaExclamationTriangle /> Changes</div>
            <div onClick={() => selectPage(5)}><IoSettingsSharp /> Settings</div>
          </div>
          <hr />
          <div className='bar'>
            <div onClick={() => logout()}><FiLogOut /> Logout</div>
          </div>
        </div>
        <div className='info'>
          {user.identifier} @ {user.organization}
        </div>
      </div>

      {
        (page === 0 && <Grades />) ||
        (page === 1 && <Teachers />) ||
        (page === 2 && <Students />) ||
        (page === 3 && <Classes />) ||
        (page === 4 && <Changes />) ||
        (page === 5 && <Settings />)
      }
    </div>
  )
}

export default Dashboard;
export { User }
