import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { IoLanguageSharp, IoToday, IoLayers } from "react-icons/io5";
import { BiSolidBookBookmark } from "react-icons/bi";
import { PiChalkboardTeacherFill, PiStudentFill } from "react-icons/pi";

import "../styles/components/Classes.css"

import ClassesPopup from './modules/ClassesPopup';

function Classes() {
  const [classes, setClasses] = useState([])
  const [className, setClassName] = useState('')
  const [classWeekday, setClassWeekday] = useState('')
  const [classTeacherForename, setClassTeacherForename] = useState('')
  const [classTeacherLastname, setClassTeacherLastname] = useState('')
  const [classSubject, setClassSubject] = useState('')
  const [classGrade, setClassGrade] = useState('')
  const [classSubgrade, setClassSubgrade] = useState('')
  const [order, setOrder] = useState(0)

  const weekdays = { "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6, "sunday": 7 }

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token')

  const refresh = () => {
    fetch(`http://localhost:100/dashboard/classes`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var classesList = Object.keys(data.classes).map(key => { return { ...data.classes[key], key } })
        const teachersList = data.teachers
        const gradesList = data.grades
        const studentsList = data.students

        if (order === 0) classesList = classesList.sort((a, b) => b.name < a.name)
        else if (order === 1) classesList = classesList.sort((a, b) => weekdays[a.weekday] - weekdays[b.weekday])
        else if (order === 2) classesList = classesList.sort((a, b) => b.teacher.forename < a.teacher.forename)
        else if (order === 3) classesList = classesList.sort((a, b) => b.subject < a.subject)
        else if (order === 4) classesList = classesList.sort((a, b) => b.grade.grade < a.grade.grade)
        else if (order === 5) classesList = classesList.sort((a, b) => b.students.length - a.students.length)

        classesList = classesList.map((class_) => {
          if (
            (className && !class_.name.includes(className.toLowerCase())) ||
            (classWeekday && !class_.weekday.includes(classWeekday.toLowerCase())) ||
            (classTeacherForename && !class_.teacher.forename.includes(classTeacherForename.toLowerCase())) ||
            (classTeacherLastname && !class_.teacher.lastname.includes(classTeacherLastname.toLowerCase())) ||
            (classSubject && !class_.subject.includes(classSubject.toLowerCase())) ||
            (classGrade && !class_.grade.grade.includes(classGrade.toLowerCase())) ||
            (classSubgrade && class_.grade.subgrade === null) ||
            (classSubgrade && !class_.grade.subgrade.includes(classSubgrade.toLowerCase()))
          ) return null

          class_.students.sort((a, b) => b.forename < a.forename)

          return (
            <ClassesPopup key={class_.id} type={'old'} refresh={refresh}
            class_={class_} teachers={teachersList} grades={gradesList} students={studentsList}/>
          )
        })

        setClasses(classesList)
      })
  }
  
  useEffect(refresh, [className, classWeekday, classTeacherForename, classTeacherLastname, classSubject, classGrade, classSubgrade, order])

  function orderClasses(schema) {
    const buttons = document.getElementsByClassName('order-buttons')[0].children
    for (var i = 0; i < 6; i++) {
      if (i === schema) buttons[i].classList.add('selected')
      else buttons[i].classList.remove('selected')
    }

    setOrder(schema)
  }

  return(
    <div className='classes-component'>
      <table className='classes'>
        <tr>
          <th>Name</th>
          <th>Weekday</th>
          <th>Start</th>
          <th>Duration</th>
          <th>Teacher</th>
          <th>Subject</th>
          <th>Grade</th>
          <th>Students</th>
        </tr>
        {classes}
      </table>
      <div className='actions'>
        <div className='sort'>
          <p>Search options</p>
          <div>
            <p>Name</p>
            <input
              value={className}
              type="text"
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div>
            <p>Weekday</p>
            <input
              value={classWeekday}
              type="text"
              onChange={(e) => setClassWeekday(e.target.value)}
            />
          </div>
          <div className='multi'>
            <p>Teacher</p>
            <div>
              <p>Forename</p>
              <input
                value={classTeacherForename}
                type="text"
                onChange={(e) => setClassTeacherForename(e.target.value)}
              />
            </div>
            <div>
              <p>Lastname</p>
              <input
                value={classTeacherLastname}
                type="text"
                onChange={(e) => setClassTeacherLastname(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p>Subject</p>
            <input
              value={classSubject}
              type="text"
              onChange={(e) => setClassSubject(e.target.value)}
            />
          </div>
          <div className='multi'>
            <p>Grade</p>
            <div>
              <p>Name</p>
              <input
                value={classGrade}
                type="text"
                onChange={(e) => setClassGrade(e.target.value)}
              />
            </div>
            <div>
              <p>Subgrade</p>
              <input
                value={classSubgrade}
                type="text"
                onChange={(e) => setClassSubgrade(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className='order'>
          <p>Order options</p>
          <div className='order-buttons'>
            <button className='selected' onClick={() => orderClasses(0)}><IoLanguageSharp /></button>
            <button onClick={() => orderClasses(1)}><IoToday /></button>
            <button onClick={() => orderClasses(2)}><PiChalkboardTeacherFill /></button>
            <button onClick={() => orderClasses(3)}><BiSolidBookBookmark /></button>
            <button onClick={() => orderClasses(4)}><IoLayers /></button>
            <button onClick={() => orderClasses(5)}><PiStudentFill /></button>
          </div>
        </div>
        <hr />
        <ClassesPopup type={'new'} refresh={refresh}/>
      </div>
    </div>
  )
}

export default Classes;