import { useState, useEffect, useMemo } from 'react'
import Popup from 'reactjs-popup'
import { IoMdClose } from "react-icons/io"

import "../../styles/components/modules/ClassesPopup.css"

function ClassesPopup({ type, refresh, class_, teachers, grades, students }) {
  const [className, setClassName] = useState('')
  const [classWeekday, setClassWeekday] = useState('')
  const [classStarttime, setClassStarttime] = useState('00:00')
  const [classDuration, setClassDuration] = useState('0')
  const [classTeacher, setClassTeacher] = useState('')
  const [classSubject, setClassSubject] = useState('')
  const [classRoom, setClassRoom] = useState('')
  const [classGrade, setClassGrade] = useState('')
  const [classStudents, setClassStudents] = useState([])
  const [error, setError] = useState('')

  const [allTeachers, setAllTeachers] = useState([])
  const [allGrades, setAllGrades] = useState([])
  const [allStudents, setAllStudents] = useState([])

  const [open, setOpen] = useState(false)
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  const old = type === 'old'

  useEffect(() => {
    if (open) {
      if (old) {
        setClassName(class_.name)
        setClassWeekday(class_.weekday)
        setClassStarttime(class_.startTime.substring(0, 5))
        setClassDuration(class_.duration)
        setClassTeacher(class_.teacher.id)
        setClassSubject(class_.subject)
        setClassRoom(class_.room)
        setClassGrade(class_.grade.id)
        setClassStudents(class_.grade.subgrade === null ? class_.students : [])
      } else {
        setClassName('')
        setClassWeekday('')
        setClassStarttime('00:00')
        setClassDuration('0')
        setClassTeacher('')
        setClassSubject('')
        setClassRoom('')
        setClassGrade('')
        setClassStudents([])
      }
      setAllTeachers(teachers)
      setAllGrades(grades)
      setAllStudents(students)
    }
  }, [open, old, class_, teachers, grades, students])

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

  const htmlStudents = useMemo(() => {
    var filteredStudents = allStudents
      .filter(student => student.grade == classGrade && 
        !classStudents.some(selectedStudent => selectedStudent.id == student.id))

    var noSubgrade
    if (classGrade !== '') {
      const grade = allGrades.find(grade => grade.id == classGrade)
      if (grade) noSubgrade = grade.subgrade === null
    }
    else noSubgrade = true

    if (!noSubgrade) filteredStudents = []
        
    return [
      ...(filteredStudents.length > 0
        ? [<option key="blank" value="">Select a student</option>,
          ...filteredStudents.map(student => (
            <option key={student.id} value={student.id}>
              {student.forename} {student.lastname}
            </option>
          ))]
        : [<option key="no-students" value="">{(!noSubgrade) ? 'All students of that grade': ((classGrade !== '') ? 'No students available' : 'Select a grade to choose students')}</option>]
      )
    ]
  }, [open, allStudents, classGrade, classStudents])

  function studentAdd(id) {
    if (id !== "") {
      const student = allStudents.find(student => student.id == id)
      if (student && !classStudents.some(s => s.id == id)) {
        setClassStudents([...classStudents, student])
      }
    }
  }

  function studentDelete(index) {
    const students = [...classStudents]
    students.splice(index, 1)
    setClassStudents(students)
  }

  function changeGrade(id) {
    setClassGrade(id)
    setClassStudents([])
  }

  function request(method) {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/classes`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ 
        classId: (old) && class_.key,
        className, 
        classWeekday, 
        classStarttime, 
        classDuration, 
        classTeacher: classTeacher !== "" ? classTeacher : undefined,
        classSubject,
        classRoom,
        classGrade: classGrade !== "" ? classGrade : undefined, 
        classStudents 
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
          New class
        </button>
      ) : (
        <tr className='class' onClick={() => setOpen(o => !o)}>
          <th>{class_.name}</th>
          <th>{class_.weekday}</th>
          <th>{class_.startTime.substring(0, 5)}</th>
          <th>{class_.duration}m</th>
          <th>{class_.teacher.forename} {class_.teacher.lastname}</th>
          <th>{class_.subject}</th>
          <th>{class_.room}</th>
          <th>{class_.grade.grade}{class_.grade.subgrade}</th>
          <th>{class_.students.length}</th>
        </tr>
      )}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='classes-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          <p>{old ? 'Change class' : 'New class'}</p>
          <div className='settings'>
            <div>
              <p>Name</p>
              <input
                value={className}
                type="text"
                onChange={(e) => (!old) && setClassName(e.target.value)}
              />
            </div>
            <div>
              <div>
                <p>Room</p>
                <input
                  value={classRoom}
                  type="text"
                  onChange={(e) => setClassRoom(e.target.value)}
                />
              </div>
              <div>
                <p>Subject</p>
                <input
                  value={classSubject}
                  type="text"
                  onChange={(e) => setClassSubject(e.target.value)}
                />
              </div>
            </div>
            <div className='time'>
              <div>
                <p>Weekday</p>
                <select
                  value={classWeekday}
                  onChange={e => setClassWeekday(e.target.value)}
                >
                  <option value="">Select a weekday</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
              <div>
                <p>Start Time</p>
                <input
                  value={classStarttime}
                  onChange={e => setClassStarttime(e.target.value)}
                  type='time'
                />
              </div>
              <div>
                <p>Duration</p>
                <input
                  value={classDuration}
                  onChange={e => setClassDuration(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div>
                <p>Teacher</p>
                <select
                  value={classTeacher}
                  onChange={e => setClassTeacher(e.target.value)}
                >
                  {htmlTeachers}
                </select>
              </div>
              <div>
                <p>Grade</p>
                <select
                  value={classGrade}
                  onChange={e => changeGrade(e.target.value)}
                >
                  {htmlGrades}
                </select>
              </div>
            </div>
            <div>
              <p>Students</p>
              <div className='students-settings'>
                <div className='students'>
                  {classStudents.map((student, index) => (
                    <span key={student.id}>
                      <p>{student.forename} {student.lastname}</p>
                      <a href onClick={() => studentDelete(index)}><IoMdClose /></a>
                    </span>
                  ))}
                </div>
                <select
                  onChange={e => studentAdd(e.target.value)}
                >
                  {htmlStudents}
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

export default ClassesPopup
