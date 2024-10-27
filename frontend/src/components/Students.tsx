import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { IoLanguageSharp } from "react-icons/io5";
import { IoLayers } from "react-icons/io5";
import { FaPeopleLine } from "react-icons/fa6";

import "../styles/components/Students.css"

import StudentsPopup from './modules/StudentsPopup';

function Students() {
  const [students, setStudents] = useState<any[]>([])
  const [studentForename, setStudentForename] = useState('')
  const [studentLastname, setStudentLastname] = useState('')
  const [studentGrade, setStudentsGrade] = useState('')
  const [studentSubgrade, setStudentSubgrade] = useState('')
  const [order, setOrder] = useState(0)

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token') as string

  const refresh = () => {
    fetch(`https://dbb.timgöllner.de/api/v1/dashboard/students`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var studentsList = Object.keys(data.students).map(key => { return { ...data.students[key], key } })

        if (order === 0) studentsList = studentsList.sort((a, b) => (b.forename < a.forename) ? 1 : 0)
        else if (order === 1) studentsList = studentsList.sort((a, b) => (b.grade < a.grade) ? 1 : 0)
        else if (order === 2) studentsList = studentsList.sort((a, b) => b.classes.length - a.classes.length)

        studentsList = studentsList.map((student) => {
          if (
            (studentForename && !student.forename.includes(studentForename.toLowerCase())) ||
            (studentLastname && !student.lastname.includes(studentLastname.toLowerCase())) ||
            (studentGrade && !student.grade.includes(studentGrade.toLowerCase())) ||
            (studentSubgrade && student.subgrade === '') ||
            (studentSubgrade && !student.subgrade.includes(studentSubgrade.toLowerCase()))
          ) return null

          student.classes.sort()

          return (
            <StudentsPopup key={student.id} refresh={refresh} student={student}/>
          )
        })

        setStudents(studentsList)
      })
  }
  
  useEffect(refresh, [studentForename, studentLastname, studentGrade, studentSubgrade, order])

  function orderStudents(schema: React.SetStateAction<number>) {
    const buttons = document.getElementsByClassName('order-buttons')[0].children
    for (var i = 0; i < 3; i++) {
      if (i === schema) buttons[i].classList.add('selected')
      else buttons[i].classList.remove('selected')
    }

    setOrder(schema)
  }

  return(
    <div className='students-component'>
      <table className='students'>
        <tr>
          <th>Name</th>
          <th>Surname</th>
          <th>Grade</th>
          <th>Classes</th>
        </tr>
        {students}
      </table>
      <div className='actions'>
        <div className='sort'>
          <p>Search options</p>
          <div>
            <p>Name</p>
            <input
              value={studentForename}
              type="text"
              onChange={(e) => setStudentForename(e.target.value)}
            />
          </div>
          <div>
            <p>Surname</p>
            <input
              value={studentLastname}
              type="text"
              onChange={(e) => setStudentLastname(e.target.value)}
            />
          </div>
          <div className='multi'>
            <p>Grade</p>
            <div>
              <p>Name</p>
              <input
                value={studentGrade}
                type="text"
                onChange={(e) => setStudentsGrade(e.target.value)}
              />
            </div>
            <div>
              <p>Subgrade</p>
              <input
                value={studentSubgrade}
                type="text"
                onChange={(e) => setStudentSubgrade(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className='order'>
          <p>Order options</p>
          <div className='order-buttons'>
            <button className='selected' onClick={() => orderStudents(0)}><IoLanguageSharp /></button>
            <button onClick={() => orderStudents(1)}><IoLayers /></button>
            <button onClick={() => orderStudents(2)}><FaPeopleLine /></button>
          </div>
        </div>
        <hr />
        <StudentsPopup refresh={refresh} student={null}/>
      </div>
    </div>
  )
}

export default Students;