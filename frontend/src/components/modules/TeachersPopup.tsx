import React, { useState, useMemo, KeyboardEvent } from 'react'
import Popup from 'reactjs-popup'

import { IoMdClose } from "react-icons/io"

import "../../styles/components/modules/TeachersPopup.css"

type Teacher = {
  key: string,
  forename: string,
  lastname: string,
  classes: number,
  subjects: string[]
}

type Props = {
  refresh: Function,
  teacher: Teacher | null
}

function TeachersPopup({ refresh, teacher }: Props) {
  const [teacherForename, setTeacherForename] = useState('')
  const [teacherLastname, setTeacherLastname] = useState('')
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([])
  const [currentSubject, setCurrentSubject] = useState('')
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setCurrentSubject('')
    setError('')
    setOpen(false)
  }

  useMemo(() => {
    if (teacher !== null) {
      setTeacherForename(teacher.forename)
      setTeacherLastname(teacher.lastname)
      setTeacherSubjects(teacher.subjects)
    } else {
      setTeacherForename('')
      setTeacherLastname('')
      setTeacherSubjects([])
    }
  }, [open])

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    const value = (e.target as HTMLInputElement).value

    if (e.keyCode === 13 && value && !(/^\s*$/.test((e.target as HTMLInputElement).value)) && value.length < 40) {
      setTeacherSubjects((oldValues) => [...oldValues, value])
      setCurrentSubject('')
    }
  }

  function handleDelete(index: number) {
    var subjects = [...teacherSubjects]
    subjects.splice(index, 1)
    setTeacherSubjects(subjects)
  }

  function request(method: string) {
    const token = localStorage.getItem('jwt-token')
    if (token == null) return

    if (method === 'DELETE' && teacher !== null && teacher.classes > 0) {
      setError('teacher has active classes')
      return
    }

    fetch(`https://dbb.timgöllner.de/api/v1/dashboard/teachers`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ teacherForename, teacherLastname, teacherSubjects }),
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
      {(teacher === null) ? (
        <button type="button" className="button" onClick={() => setOpen(o => !o)}>
          New Teacher     
        </button>
      ) : (
        <tr className='teacher' onClick={() => setOpen(o => !o)}>
          <th>{teacher.forename}</th>
          <th>{teacher.lastname}</th>
          <th>{teacher.classes}</th>
          <th>{teacher.subjects.join(', ')}</th>
        </tr>
      )}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='teachers-popup'>
          <button className="close" onClick={closeModal}><IoMdClose /></button>
          {(teacher === null) ? (<p>New teacher</p>) : (<p>Change teacher</p>)}
          <div className='settings'>
            <div>
              <div>
                <p>Forename</p>
                <input
                  value={teacherForename}
                  type="text"
                  onChange={(e) => (teacher === null) && setTeacherForename(e.target.value)}
                />
              </div>
              <div>
                <p>Lastname</p>
                <input
                  value={teacherLastname}
                  type="text"
                  onChange={(e) => (teacher === null) && setTeacherLastname(e.target.value)}
                />
              </div>
            </div>
            <div className='subject-settings'>
              <p>Subjects</p>
              <div>
                <div className='subjects'>
                  {teacherSubjects.map((subject, index) => (
                    <span>
                      <p>{subject}</p>
                      <button onClick={() => handleDelete(index)}><IoMdClose /></button>
                    </span>
                  ))}
                </div>
                <input
                  value={currentSubject}
                  type="text"
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  onKeyUp={(e) => handleKeyUp(e)}
                />
              </div>
            </div>
          </div>
          <div className='footer'>
            <div className={(teacher !== null) ? 'actions old' : 'actions'}>
              {(teacher === null) ? (
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

export default TeachersPopup;