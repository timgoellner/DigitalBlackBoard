import React, { useState, useMemo } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";

import "../../styles/components/modules/StudentsPopup.css"

type Student = {
  key: string,
  forename: string,
  lastname: string,
  identifier: string,
  grade: string,
  subgrade: string,
  classes: string[]
}

type Props = {
  refresh: Function,
  student: Student | null
}

function StudentsPopup({ refresh, student }: Props) {
  const [studentForename, setStudentForename] = useState('')
  const [studentLastname, setStudentLastname] = useState('')
  const [studentGrade, setStudentGrade] = useState('')
  const [studentSubgrade, setStudentSubgrade] = useState('')
  const [studentIdentifier, setStudentIdentifier] = useState('')
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  useMemo(() => {
    if (student !== null) {
      setStudentForename(student.forename)
      setStudentLastname(student.lastname)
      setStudentGrade(student.grade)
      setStudentSubgrade(student.subgrade)
      setStudentIdentifier(student.identifier)
    } else {
      setStudentForename('')
      setStudentLastname('')
      setStudentGrade('')
      setStudentSubgrade('')
      setStudentIdentifier('')
    }
  }, [open])

  function request(method: string) {
    const token = localStorage.getItem('jwt-token')
    if (token == null) return

    fetch(`https://dbb.timgöllner.de/api/v1/dashboard/students`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ studentForename, studentLastname, studentGrade, studentSubgrade, id: (student !== null) ? student.key : null }),
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
      {(student === null) ? (
        <button type="button" className="button" onClick={() => setOpen(o => !o)}>
          New student
        </button>
      ) : (
        <tr className='student' onClick={() => setOpen(o => !o)}>
          <th>{student.forename}</th>
          <th>{student.lastname}</th>
          <th>{student.grade + ((student.subgrade !== null) && student.subgrade)}</th>
          <th>{student.classes.join(', ')}</th>
        </tr>
      )}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='students-popup'>
          <button className="close" onClick={closeModal}><IoMdClose /></button>
          {(student === null) ? (<p>New student</p>) : (<p>Change student</p>)}
          <div className='settings'>
            <div>
              <div>
                <p>Forename</p>
                <input
                  value={studentForename}
                  type="text"
                  onChange={(e) => (student === null) && setStudentForename(e.target.value)}
                />
              </div>
              <div>
                <p>Lastname</p>
                <input
                  value={studentLastname}
                  type="text"
                  onChange={(e) => (student === null) && setStudentLastname(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div>
                <p>Grade</p>
                <input
                  value={studentGrade}
                  type="text"
                  onChange={(e) => setStudentGrade(e.target.value)}
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
            {(student !== null) && (
              <div className='identifier'>
                <p>Identifier:</p>
                <p>{studentIdentifier}</p>
              </div>
            )}
          </div>
          <div className='footer'>
            <div className={(student !== null) ? 'actions old' : 'actions'}>
              {(student === null) ? (
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

export default StudentsPopup;