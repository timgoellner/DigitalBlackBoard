import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { BiSolidBookBookmark } from "react-icons/bi";
import { MdSmsFailed } from "react-icons/md";
import { PiChalkboardTeacherFill } from "react-icons/pi";

import "../styles/components/Changes.css"

import ChangesPopup from './modules/ChangesPopup';

function Changes() {
  const [changes, setChanges] = useState([])
  const [changeType, setChangeType] = useState('')
  const [changeClass, setChangeClass] = useState('')
  const [changeTeacherForename, setChangeTeacherForename] = useState('')
  const [changeTeacherLastname, setChangeTeacherLastname] = useState('')
  const [changeSubject, setChangeSubject] = useState('')
  const [changeGrade, setChangeGrade] = useState('')
  const [changeSubgrade, setChangeSubgrade] = useState('')
  const [order, setOrder] = useState(0)

  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [grades, setGrades] = useState([])

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token')

  const refresh = () => {
    fetch(`https://dbb.timgöllner.de/api/dashboard/changes`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var changesList = Object.keys(data.changes).map(key => { return { ...data.changes[key], key } })
        const teachersList = data.teachers
        const classesList = data.classes
        const gradesList = data.grades

        if (order === 0) changesList = changesList.sort((a, b) => b.type < a.type)
        else if (order === 1) changesList = changesList.sort((a, b) => {
          if (a.teacher.forename === null) return 1
          else if (b.teacher.forename === null) return -1

          return b.teacher.forename < a.teacher.forename
        })
        else if (order === 2) changesList = changesList.sort((a, b) => {
          if (a.subject === null) return 1
          else if (b.subject === null) return -1

          return b.subject < a.subject
        })

        changesList = changesList.map((change) => {
          if (
            (changeType && !change.type.toLowerCase().includes(changeType)) ||
            (changeClass && !change.class.name.toLowerCase().includes(changeClass.toLowerCase())) ||
            (changeTeacherForename && change.teacher.forename === null) ||
            (changeTeacherForename && !change.teacher.forename.toLowerCase().includes(changeTeacherForename.toLowerCase())) ||
            (changeTeacherLastname && change.teacher.lastname === null) ||
            (changeTeacherLastname && !change.teacher.lastname.toLowerCase().includes(changeTeacherLastname.toLowerCase())) ||
            (changeSubject && change.subject === null) ||
            (changeSubject && !change.subject.toLowerCase().includes(changeSubject.toLowerCase())) ||
            (changeGrade && !change.grade.grade.toLowerCase().includes(changeGrade.toLowerCase())) ||
            (changeSubgrade && change.grade.subgrade === null) ||
            (changeSubgrade && !change.grade.subgrade.toLowerCase().includes(changeSubgrade.toLowerCase()))
          ) return null

          return (
            <ChangesPopup key={change.id} type={'old'} refresh={refresh}
            change={change} teachers={teachersList} classes={classesList} grades={gradesList}/>
          )
        })

        setChanges(changesList)
        setTeachers(teachersList)
        setClasses(classesList)
        setGrades(gradesList)
      })
  }
  
  useEffect(refresh, [changeType, changeClass, changeTeacherForename, changeTeacherLastname, changeSubject, changeGrade, changeSubgrade, order])

  function orderChanges(schema) {
    const buttons = document.getElementsByClassName('order-buttons')[0].children
    for (var i = 0; i < 3; i++) {
      if (i === schema) buttons[i].classList.add('selected')
      else buttons[i].classList.remove('selected')
    }

    setOrder(schema)
  }

  return(
    <div className='changes-component'>
      <table className='changes'>
        <tr>
          <th>Type</th>
          <th>Class</th>
          <th>Grade</th>
          <th>Teacher</th>
          <th>Subject</th>
          <th>Room</th>
        </tr>
        {changes}
      </table>
      <div className='actions'>
        <div className='sort'>
          <p>Search options</p>
          <div>
            <p>Type</p>
            <input
              value={changeType}
              type="text"
              onChange={(e) => setChangeType(e.target.value)}
            />
          </div>
          <div>
            <p>Class</p>
            <input
              value={changeClass}
              type="text"
              onChange={(e) => setChangeClass(e.target.value)}
            />
          </div>
          <div className='multi'>
            <p>Teacher</p>
            <div>
              <p>Name</p>
              <input
                value={changeTeacherForename}
                type="text"
                onChange={(e) => setChangeTeacherForename(e.target.value)}
              />
            </div>
            <div>
              <p>Surname</p>
              <input
                value={changeTeacherLastname}
                type="text"
                onChange={(e) => setChangeTeacherLastname(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p>Subject</p>
            <input
              value={changeSubject}
              type="text"
              onChange={(e) => setChangeSubject(e.target.value)}
            />
          </div>
          <div className='multi'>
            <p>Grade</p>
            <div>
              <p>Name</p>
              <input
                value={changeGrade}
                type="text"
                onChange={(e) => setChangeGrade(e.target.value)}
              />
            </div>
            <div>
              <p>Subgrade</p>
              <input
                value={changeSubgrade}
                type="text"
                onChange={(e) => setChangeSubgrade(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className='order'>
          <p>Order options</p>
          <div className='order-buttons'>
            <button className='selected' onClick={() => orderChanges(0)}><MdSmsFailed /></button>
            <button onClick={() => orderChanges(1)}><PiChalkboardTeacherFill /></button>
            <button onClick={() => orderChanges(2)}><BiSolidBookBookmark /></button>
          </div>
        </div>
        <hr />
        <ChangesPopup type={'new'} refresh={refresh} teachers={teachers} classes={classes} grades={grades}/>
      </div>
    </div>
  )
}

export default Changes;