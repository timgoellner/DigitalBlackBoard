import React, { useState, useMemo, ReactElement } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { FaPeopleLine, FaCircleInfo  } from "react-icons/fa6";
import { BiSolidBookBookmark } from "react-icons/bi";
import { MdMeetingRoom } from "react-icons/md";

import "../styles/Blackboard.css"
import { User } from "./Dashboard"
import { SmallStudent } from '../components/modules/SmallTypes'

type BlackboardElement = {
  weekday: string
  endTime: number
  startTime: number
  name: string
  teacherForename: string
  teacherLastname: string
  subject: string
  room: string
  changeType: string
  changeSubject: string | null
  changeRoom: string | null
  changeInformation: string | null
  changeTeacherForename: string | null
  changeTeacherLastname: string | null
}

function Blackboard() {
  const [blackboard, setBlackboard] = useState<ReactElement[][]>([[], [], [], [], [], [], []])
  const [student, setStudent] = useState<SmallStudent>()
  const [timelines, setTimelines] = useState<ReactElement[]>([])
  const [news, setNews] = useState('')

  const navigate = useNavigate()
  const user = useLoaderData() as User
  
  const token = localStorage.getItem('jwt-token') as string

  const weekdays = { "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6, "sunday": 7 }
  var currentWeekday = 0

  const refresh = () => {
    fetch(`https://dbb.timgöllner.de/api/v1/blackboard/${user.organization}/${user.identifier}`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var blackboardData = data.blackboardData
        var blackboardHtml: ReactElement[][] = [[], [], [], [], [], [], []]

        blackboardData.forEach((element: BlackboardElement) => {
          const index = weekdays[element.weekday as keyof typeof weekdays] - 1

          blackboardHtml[index] = [
            ...blackboardHtml[index],
            <div className={'element ' + ((element.changeType !== null) ? element.changeType : '')} style={{ height: `${((element.endTime - element.startTime) / (data.latest - data.earliest)) * 65}dvh`, top: `${((element.startTime - data.earliest) / (data.latest - data.earliest)) * 65}dvh` }}>
              <div className='element-time'>
                <p>{String((element.startTime / 60) | 0).padStart(2, '0')}:{String(element.startTime % 60).padStart(2, '0')}</p>
                <p>{String((element.endTime / 60) | 0).padStart(2, '0')}:{String(element.endTime % 60).padStart(2, '0')}</p>
              </div>
              <div className='data'>
                <span>
                  <FaPeopleLine />
                  <p>{element.name}</p>
                </span>
                {(element.changeInformation) && (
                  <span>
                    <FaCircleInfo />
                    <p className='info'>{element.changeInformation}</p>
                  </span>
                )}
                <span>
                  <PiChalkboardTeacherFill />
                  {(element.changeTeacherForename) ? <p className='change'>{element.changeTeacherForename} {element.changeTeacherLastname}</p> : <p>{element.teacherForename} {element.teacherLastname}</p>}
                </span>
                <span>
                  <BiSolidBookBookmark />
                  {(element.changeSubject) ? <p className='change'>{element.changeSubject}</p> : <p>{element.subject}</p>}
                </span>
                <span>
                  <MdMeetingRoom />
                  {(element.changeRoom) ? <p className='change'>{element.changeRoom}</p> : <p>{element.room}</p>}
                </span>
              </div>
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
                <p>{(data.earliest / 60 | 0) + i}</p>
                <div></div>
              </span>
            </div>
          )
        }

        setBlackboard(blackboardHtml)
        setStudent(data.student)
        setTimelines(timelinesHtml)
        setNews(data.news)
      })
  }

  useMemo(refresh, [])

  function logout() {
    localStorage.removeItem('jwt-token')
    navigate('/login')
  }

  function shiftWeekday(direction: string) {
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
          <span>
            <p>Digital</p>
            <p>Black</p>
            <p>Board</p>
          </span>
          <button onClick={() => logout()}>Logout</button>
        </header>
        <div className='news'>
          {news && 
            <p>{news}</p>
          }
        </div>
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
