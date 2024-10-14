import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { IoLanguageSharp } from "react-icons/io5";
import { BiSolidBookBookmark } from "react-icons/bi";
import { FaPeopleLine } from "react-icons/fa6";

import "../styles/components/Teachers.css"

import TeachersPopup from './modules/TeachersPopup';

function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [teacherForeame, setTeacherForename] = useState('')
  const [teacherLastname, setTeacherLastname] = useState('')
  const [order, setOrder] = useState(0)

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token')

  const refresh = () => {
    fetch(`https://dbb.timgöllner.de/api/dashboard/teachers`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var teachersList = Object.keys(data.teachers).map(key => { return { ...data.teachers[key], key } })

        if (order === 0) teachersList = teachersList.sort((a, b) =>  b.forename < a.forename)
        else if (order === 1) teachersList = teachersList.sort((a, b) =>  b.subjects.length - a.subjects.length)
        else if (order === 2) teachersList = teachersList.sort((a, b) => b.classes - a.classes)

        teachersList = teachersList.map((teacher) => {
          if (
            (teacherForeame && !teacher.forename.includes(teacherForeame.toLowerCase())) ||
            (teacherLastname && !teacher.lastname.includes(teacherLastname.toLowerCase()))
          ) return null

          teacher.subjects.sort()

          return (
            <TeachersPopup key={teacher.id} type={'old'} refresh={refresh} teacher={teacher}/>
          )
        })

        setTeachers(teachersList)
      })
  }
  
  useEffect(refresh, [teacherForeame, teacherLastname, order])

  function orderTeachers(schema) {
    const buttons = document.getElementsByClassName('order-buttons')[0].children
    for (var i = 0; i < 3; i++) {
      if (i === schema) buttons[i].classList.add('selected')
      else buttons[i].classList.remove('selected')
    }

    setOrder(schema)
  }

  return(
    <div className='teachers-component'>
      <table className='teachers'>
        <tr>
          <th>Forename</th>
          <th>Lastname</th>
          <th>Classes</th>
          <th>Subjects</th>
        </tr>
        {teachers}
      </table>
      <div className='actions'>
        <div className='sort'>
          <p>Search options</p>
          <div>
            <p>Forename</p>
            <input
              value={teacherForeame}
              type="text"
              onChange={(e) => setTeacherForename(e.target.value)}
            />
          </div>
          <div>
            <p>Lastname</p>
            <input
              value={teacherLastname}
              type="text"
              onChange={(e) => setTeacherLastname(e.target.value)}
            />
          </div>
        </div>
        <div className='order'>
          <p>Order options</p>
          <div className='order-buttons'>
            <button className='selected' onClick={() => orderTeachers(0)}><IoLanguageSharp /></button>
            <button onClick={() => orderTeachers(1)}><BiSolidBookBookmark /></button>
            <button onClick={() => orderTeachers(2)}><FaPeopleLine /></button>
          </div>
        </div>
        <hr />
        <TeachersPopup type={'new'} refresh={refresh}/>
      </div>
    </div>
  )
}

export default Teachers;