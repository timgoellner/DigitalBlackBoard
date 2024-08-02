import { useState, useMemo } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";

import "../../styles/components/modules/StudentsPopup.css"

function StudentsPopup({ type, refresh, student }) {
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

  const old = type === 'old'

  useMemo(() => {
    setStudentForename((old) ? student.forename : '')
    setStudentLastname((old) ? student.lastname : '')
    setStudentGrade((old) ? student.grade : '')
    setStudentSubgrade((old) ? student.subgrade : '')
    setStudentIdentifier((old) ? student.identifier : '')
  }, [open])

  function request(method) {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/students`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ studentForename, studentLastname, studentGrade, studentSubgrade, id: (old) ? student.key : null }),
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
          New student
        </button>
      )) || ((old) && (
        <tr className='student' onClick={() => setOpen(o => !o)}>
          <th>{student.forename}</th>
          <th>{student.lastname}</th>
          <th>{student.grade + ((student.subgrade !== null) && student.subgrade)}</th>
          <th>{student.classes.join(', ')}</th>
        </tr>
      ))}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='students-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          {((!old) && (<p>New student</p>)) ||
           ((old) && (<p>Change student</p>))}
          <div className='settings'>
            <div>
              <div>
                <p>Forename</p>
                <input
                  value={studentForename}
                  type="text"
                  onChange={(e) => (!old) && setStudentForename(e.target.value)}
                />
              </div>
              <div>
                <p>Lastname</p>
                <input
                  value={studentLastname}
                  type="text"
                  onChange={(e) => (!old) && setStudentLastname(e.target.value)}
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
            {(old) && (
              <div className='identifier'>
                <p>Identifier:</p>
                <p>{studentIdentifier}</p>
              </div>
            )}
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

export default StudentsPopup;