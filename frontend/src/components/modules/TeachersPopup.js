import { useState, useMemo } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";

import "../../styles/components/modules/TeachersPopup.css"

function TeachersPopup({ type, refresh, teacher }) {
  const [teacherForename, setTeacherForename] = useState('')
  const [teacherLastname, setTeacherLastname] = useState('')
  const [teacherSubjects, setTeacherSubjects] = useState([])
  const [currentSubject, setCurrentSubject] = useState('')
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setCurrentSubject('')
    setError('')
    setOpen(false)
  }

  const old = type === 'old'

  useMemo(() => {
    setTeacherForename((old) ? teacher.forename : '')
    setTeacherLastname((old) ? teacher.lastname : '')
    setTeacherSubjects((old) ? teacher.subjects : [])
  }, [open])

  function handleKeyUp(e) {
    if (e.keyCode === 13 && e.target.value && !(/^\s*$/.test(e.target.value)) && e.target.value.length < 40) {
      setTeacherSubjects((oldValues) => [...oldValues, e.target.value])
      setCurrentSubject('')
    }
  }

  function handleDelete(index) {
    var subjects = [...teacherSubjects]
    subjects.splice(index, 1)
    setTeacherSubjects(subjects)
  }

  function request(method) {
    const token = localStorage.getItem('jwt-token')

    if (method === 'DELETE' && teacher.classes > 0) {
      setError('teacher has active classes')
      return
    }

    fetch(`http://localhost:100/dashboard/teachers`, {
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
      {((!old) && (
        <button type="button" className="button" onClick={() => setOpen(o => !o)}>
          New Teacher     
        </button>
      )) || ((old) && (
        <tr className='teacher' onClick={() => setOpen(o => !o)}>
          <th>{teacher.forename}</th>
          <th>{teacher.lastname}</th>
          <th>{teacher.classes}</th>
          <th>{teacher.subjects.join(', ')}</th>
        </tr>
      ))}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='teachers-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          {((!old) && (<p>New teacher</p>)) ||
           ((old) && (<p>Change teacher</p>))}
          <div className='settings'>
            <div>
              <div>
                <p>Forename</p>
                <input
                  value={teacherForename}
                  type="text"
                  onChange={(e) => (!old) && setTeacherForename(e.target.value)}
                />
              </div>
              <div>
                <p>Lastname</p>
                <input
                  value={teacherLastname}
                  type="text"
                  onChange={(e) => (!old) && setTeacherLastname(e.target.value)}
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
                      <a href onClick={() => handleDelete(index)}><IoMdClose /></a>
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
            <div className={(old) ? 'actions old' : 'actions'}>
              {((!old) && (
                <button onClick={() => request('POST')}>Create</button>
              )) || ((old) && (
                <>
                  <button onClick={() => request('PUT')}>Change</button>
                  <button onClick={() => request('DELETE')}>Remove</button>
                </>
              ))}
            </div>
            <error>{error}</error>
          </div>
        </div>
      </Popup>
    </>
  )
}

export default TeachersPopup;