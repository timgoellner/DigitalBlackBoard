import React, { useState, useEffect, useMemo } from 'react'
import Popup from 'reactjs-popup'
import { IoMdClose } from "react-icons/io"

import "../../styles/components/modules/ChangesPopup.css"
import { SmallTeacher, SmallGrade, SmallClass } from './SmallTypes'

type Change = {
  key: string,
  type: string,
  class: { id: string, name: string },
  teacher: SmallTeacher,
  subject: string,
  room: string,
  grade: SmallGrade,
  information: string
}

type Props = {
  refresh: Function,
  change: Change | null,
  teachers: SmallTeacher[],
  grades: SmallGrade[],
  classes: SmallClass[]
}

function ChangesPopup({ refresh, change, teachers, classes, grades }: Props) {
  const [changeType, setChangeType] = useState('')
  const [changeClass, setChangeClass] = useState('')
  const [changeTeacher, setChangeTeacher] = useState('')
  const [changeSubject, setChangeSubject] = useState('')
  const [changeRoom, setChangeRoom] = useState('')
  const [changeInformation, setChangeInformation] = useState('')
  const [error, setError] = useState('')

  const [className, setClassName] = useState('')
  const [classGrade, setClassGrade] = useState('')

  const [allTeachers, setAllTeachers] = useState<SmallTeacher[]>([])
  const [allClasses, setAllClasses] = useState<SmallClass[]>([])
  const [allGrades, setAllGrades] = useState<SmallGrade[]>([])

  const [open, setOpen] = useState(false)
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  useEffect(() => {
    if (open) {
      if (change !== null) {
        setChangeType(change.type)
        setChangeClass(change.class.id)
        setChangeTeacher(change.teacher.id)
        setChangeSubject(change.subject)
        setChangeRoom(change.room)
        setChangeInformation(change.information)
      } else {
        setChangeType('')
        setChangeClass('')
        setChangeTeacher('')
        setChangeSubject('')
        setChangeRoom('')
        setClassGrade('')
        setChangeInformation('')
      }
      setAllTeachers(teachers)
      setAllGrades(grades)
      setAllClasses(classes)
    }
  }, [open, change, teachers, grades, classes])

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
      .filter(class_ => class_.gradeId == classGrade && 
        ((className === '') ? true : class_.name.includes(className)))
        
    return [
      ...(filteredClasses.length > 0
        ? [<option key="blank" value="">Select a class</option>,
          ...filteredClasses.map(class_ => (
            <option key={class_.id} value={class_.id}>
              {class_.name}  |  {class_.weekday}
            </option>
          ))]
        : [<option key="no-classes" value="">{(classGrade === '') ? 'Select a grade to choose classes' : 'No classes available'}</option>]
      )
    ]
  }, [open, allClasses, classGrade, className])

  function alterGrade(id: React.SetStateAction<string>) {
    setClassGrade(id)
    setChangeClass('')
  }

  function request(method: string) {
    const token = localStorage.getItem('jwt-token')
    if (token == null) return

    fetch(`https://dbb.timgöllner.de/api/v1/dashboard/changes`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ 
        changeId: (change !== null) && change.key,
        changeType, 
        changeClass,
        changeTeacher: changeTeacher !== "" ? changeTeacher : undefined,
        changeSubject,
        changeRoom,
        changeInformation
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
      {change === null ? (
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
          <button className="close" onClick={closeModal}><IoMdClose /></button>
          <p>{change !== null ? 'Alter change' : 'New change'}</p>
          <div className='settings'>
            {change === null ?
              <>
                <div>
                  <p>Class Search Options</p>
                  <div className='multi class-settings'>
                    <div>
                      <p>Grade</p>
                      <select
                        value={classGrade}
                        onChange={e => alterGrade(e.target.value)}
                      >
                        {htmlGrades}
                      </select>
                    </div>
                    <div>
                      <p>Name</p>
                      <input
                        value={className}
                        type="text"
                        onChange={(e) => setClassName(e.target.value)}
                      />
                    </div>
                  </div>
                  <select
                    value={changeClass}
                    onChange={e => setChangeClass(e.target.value)}
                  >
                    {htmlClasses}
                  </select>
                </div>
                <hr />
              </>
            : 
              <div className='multi title'>
                <div>
                  <p>Class</p>
                  <p>{allClasses.find(class_ => class_.id == changeClass)?.name}</p>
                </div>
                <div>
                  <p>Grade</p>
                  <p>{allClasses.find(class_ => class_.id == changeClass)?.grade}{allClasses.find(class_ => class_.id == changeClass)?.subgrade}</p>
                </div>
              </div>
            }
            <div>
              <p>Type</p>
              <select
                  value={changeType}
                  onChange={e => setChangeType(e.target.value)}
              >
                <option value="">Select a type</option>
                <option value="cancellation">Cancellation</option>
                <option value="change">Change</option>
                <option value="information">Information</option>
              </select>
            </div>
            {changeType === 'change' &&
            <>
              <div className='multi'>
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
              </div>
            </>
            }
            {(changeType === 'change' || changeType === 'information') &&
              <div>
                <p>Information</p>
                <input
                  value={changeInformation}
                  type="text"
                  onChange={(e) => setChangeInformation(e.target.value)}
                />
              </div>
            }
          </div>
          <div className='footer'>
            <div className={change !== null ? 'actions old' : 'actions'}>
              {change === null ? (
                <button onClick={() => request('POST')}>Create</button>
              ) : (
                <>
                  <button onClick={() => request('PUT')}>Change</button>
                  <button onClick={() => request('DELETE')}>Remove</button>
                </>
              )}
            </div>
            <p className='error'>{error}</p>
          </div>
        </div>
      </Popup>
    </>
  )
}

export default ChangesPopup
export { Change }
