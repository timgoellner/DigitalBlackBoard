import { useState, useEffect, useMemo } from 'react'
import Popup from 'reactjs-popup'
import { IoMdClose } from "react-icons/io"

import "../../styles/components/modules/ChangesPopup.css"

function ChangesPopup({ type, refresh, change, teachers, classes, grades }) {
  const [changeType, setChangeType] = useState('')
  const [changeClass, setChangeClass] = useState('')
  const [changeTeacher, setChangeTeacher] = useState('')
  const [changeSubject, setChangeSubject] = useState('')
  const [changeRoom, setChangeRoom] = useState('')
  const [error, setError] = useState('')

  const [className, setClassName] = useState('')
  const [classGrade, setClassGrade] = useState('')

  const [allTeachers, setAllTeachers] = useState([])
  const [allClasses, setAllClasses] = useState([])
  const [allGrades, setAllGrades] = useState([])

  const [open, setOpen] = useState(false)
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  const old = type === 'old'

  const types = [ "cancellation", "change", "information" ]

  useEffect(() => {
    if (open) {
      if (old) {
        setChangeType(change.type)
        setChangeClass(change.class.id)
        setChangeTeacher(change.teacher.id)
        setChangeSubject(change.subject)
        setChangeRoom(change.room)
      } else {
        setChangeType('')
        setChangeClass('')
        setChangeTeacher('')
        setChangeSubject('')
        setChangeRoom('')
        setClassGrade('')
      }
      setAllTeachers(teachers)
      setAllGrades(grades)
      setAllClasses(classes)
    }
  }, [open, old, change, teachers, grades, classes])

  const htmlTeachers = useMemo(() => 
    [
      <option key="blank" value="">Select a teacher</option>,
      ...allTeachers.map(teacher => (
        <option key={teacher.id} value={teacher.id}>
          {teacher.forename} {teacher.lastname}
        </option>
      ))
    ],
  [allTeachers])

  const htmlGrades = useMemo(() => 
    [
      <option key="blank" value="">Select a grade</option>,
      ...allGrades.map(grade => (
        <option key={grade.id} value={grade.id}>
          {grade.grade}{grade.subgrade && grade.subgrade}
        </option>
      ))
    ],
  [allGrades])

  const htmlClasses = useMemo(() => {
    var filteredClasses = allClasses
      .filter(class_ => class_.grade == classGrade && 
        ((className === '') ? true : class_.name == className))
        
    return [
      ...(filteredClasses.length > 0
        ? [<option key="blank" value="">Select a student</option>,
          ...filteredClasses.map(student => (
            <option key={student.id} value={student.id}>
              {student.forename} {student.lastname}
            </option>
          ))]
        : [<option key="no-students" value="">{(classGrade === '') ? 'Select a grade to choose students' : 'No classes available'}</option>]
      )
    ]
  }, [open, allClasses, classGrade, className])

  function alterGrade(id) {
    setClassGrade(id)
    setChangeClass('')
  }

  function request(method) {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/changes`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ 
        classId: (old) && change.key,
        changeType, 
        changeClass,
        changeTeacher: changeTeacher !== "" ? changeTeacher : undefined,
        changeSubject,
        changeRoom
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'success') {
          setOpen(false)
          refresh()
        } else {
          setError(data.message)
        }
      })
  }

  return (
    <>
      {!old ? (
        <button type="button" className="button" onClick={() => setOpen(o => !o)}>
          New change
        </button>
      ) : (
        <tr className='change' onClick={() => setOpen(o => !o)}>
          <th>{change.type}</th>
          <th>{change.class.name}</th>
          <th>{change.grade.grade}{change.grade.subgrade}</th>
          <th>{change.teacher.forename} {change.teacher.lastname}</th>
          <th>{change.subject}</th>
          <th>{change.room}</th>
        </tr>
      )}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='changes-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          <p>{old ? 'Alter change' : 'New change'}</p>
          <div className='settings'>
            <div>
              <p>Type</p>
              <input
                value={changeType}
                type="text"
                onChange={(e) => (!old) && setChangeType(e.target.value)}
              />
            </div>
            <div>
              <div>
                <p>Room</p>
                <input
                  value={changeRoom}
                  type="text"
                  onChange={(e) => setChangeRoom(e.target.value)}
                />
              </div>
              <div>
                <p>Subject</p>
                <input
                  value={changeSubject}
                  type="text"
                  onChange={(e) => setChangeSubject(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div>
                <p>Teacher</p>
                <select
                  value={changeTeacher}
                  onChange={e => setChangeTeacher(e.target.value)}
                >
                  {htmlTeachers}
                </select>
              </div>
              <div>
                <p>Grade</p>
                <select
                  value={classGrade}
                  onChange={e => alterGrade(e.target.value)}
                >
                  {htmlGrades}
                </select>
              </div>
            </div>
          </div>
          <div className='footer'>
            <div className={old ? 'actions old' : 'actions'}>
              {!old ? (
                <button onClick={() => request('POST')}>Create</button>
              ) : (
                <>
                  <button onClick={() => request('PUT')}>Change</button>
                  <button onClick={() => request('DELETE')}>Remove</button>
                </>
              )}
            </div>
            <error>{error}</error>
          </div>
        </div>
      </Popup>
    </>
  )
}

export default ChangesPopup
