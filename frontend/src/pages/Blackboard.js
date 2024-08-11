import { useNavigate, useLoaderData } from 'react-router-dom';
import { useState, useMemo } from 'react';

import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";

import "../styles/Blackboard.css"

function Blackboard() {
  const [blackboard, setBlackboard] = useState([[], [], [], [], [], [], []])
  const [student, setStudent] = useState()
  const [timelines, setTimelines] = useState([])

  const navigate = useNavigate()
  const user = useLoaderData()
  const token = localStorage.getItem('jwt-token')

  const weekdays = { "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6, "sunday": 7 }
  var currentWeekday = 0

  const refresh = () => {
    fetch(`http://localhost:100/blackboard/${user.organization}/${user.identifier}`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var blackboardData = data.blackboardData
        var blackboardHtml = [[], [], [], [], [], [], []]

        blackboardData.forEach((element) => {
          const index = weekdays[element.weekday]-1

          blackboardHtml[index] = [
            ...blackboardHtml[index],
            <div className='element' style={{ height: `${((element.endTime - element.startTime) / (data.latest - data.earliest)) * 65}dvh`, top: `${((element.startTime - data.earliest) / (data.latest - data.earliest)) * 65}dvh` }}>
              <p>{String((element.startTime / 60) | 0).padStart(2, '0')}:{String(element.startTime % 60).padStart(2, '0')}</p>
              <div className='data'>
                <p>{element.name}</p>
              </div>
              <p>{String((element.endTime / 60) | 0).padStart(2, '0')}:{String(element.endTime % 60).padStart(2, '0')}</p>
            </div>
          ]
        })

        var timelinesHtml = []
        const timelinesCount = ((data.latest / 60) | 0) - ((data.earliest / 60) | 0)
        const topOffset = 1 - (data.earliest / 60 % 1)
        const hour = 65 / ((data.latest - data.earliest) / 60)
        for (var i = 1; i <= timelinesCount; i++) {
          timelinesHtml.push(
            <div className='timeline' style={{ height: `${hour}dvh`, marginTop: `${(i === 1) ? (hour * topOffset) : 0}dvh`}}>
              <span>
                <p>{parseInt((data.earliest / 60) | 0) + i}</p>
                <div></div>
              </span>
            </div>
          )
        }

        setBlackboard(blackboardHtml)
        setStudent(data.student)
        setTimelines(timelinesHtml)
      })
  }

  useMemo(refresh, [])

  function logout() {
    localStorage.removeItem('jwt-token')
    navigate('/login')
  }

  function shiftWeekday(direction) {
    const activeWeekdays = blackboard.filter(weekday => weekday.length > 0).length
    const newWeekday = (direction === 'right') ? (currentWeekday + 1) : (currentWeekday - 1)

    if (activeWeekdays <= newWeekday || newWeekday < 0) return

    document.getElementsByClassName('blackboard')[0].classList.remove("weekday-" + String(currentWeekday))
    document.getElementsByClassName('blackboard')[0].classList.add("weekday-" + String(newWeekday))
    currentWeekday = newWeekday
  }

  return (
    <>
      <div className='blackboard-page'>
        <header>
          <p>{user.organization}<br />{student?.forename} {student?.lastname}</p>
          <h1>Blackboard</h1>
          <button onClick={() => logout()}>Logout</button>
        </header>
        <main className='content'>
          <div className='buttons'>
            <button onClick={() => shiftWeekday('left')}><IoIosArrowBack /></button>
            <button onClick={() => shiftWeekday('right')}><IoIosArrowForward /></button>
          </div>
          <div>
            <div className='blackboard weekday-0'>
              {blackboard.map((weekday, index) => {
                return ((weekday.length > 0) && (
                  <div className='weekday'>
                    <p>{Object.keys(weekdays).find((_, dayIndex) => dayIndex === index)}</p>
                    <div>
                      <div className='timelines'>
                        {timelines}
                      </div>
                      
                      {weekday}
                    </div>
                  </div>
                ))
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Blackboard;
