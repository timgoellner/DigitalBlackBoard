import { useState, useMemo } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";

import "../../styles/components/modules/ClassesPopup.css"

function ClassesPopup({ type, refresh, class_, teachers, grades, students }) {
  const [className, setClassName] = useState('')
  const [classWeekday, setClassWeekday] = useState('')
  const [classTeacher, setClassTeacher] = useState(null)
  const [classSubject, setClassSubject] = useState('')
  const [classGrade, setClassGrade] = useState(null)
  const [classStudents, setClassStudents] = useState([])
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  const old = type === 'old'

  useMemo(() => {
    setClassName((old) ? class_.name : '')
    setClassWeekday((old) ? class_.weekday : '')
    setClassTeacher((old) ? class_.teacher : null)
    setClassSubject((old) ? class_.subject : '')
    setClassGrade((old) ? class_.grade : null)
    setClassStudents((old) ? class_.students : [])
  }, [open])

  function request(method) {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/classes`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ className, classWeekday, classTeacher, classSubject, classGrade, classStudents }),
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
          New class
        </button>
      )) || ((old) && (
        <tr className='class' onClick={() => setOpen(o => !o)}>
          <th>{class_.name}</th>
          <th>{class_.weekday}</th>
          <th>{class_.startTime.substring(0, 5)}</th>
          <th>{class_.duration}m</th>
          <th>{class_.teacher.forename} {class_.teacher.lastname}</th>
          <th>{class_.subject}</th>
          <th>{class_.grade.grade}{class_.grade.subgrade}</th>
          <th>{class_.students.length}</th>
        </tr>
      ))}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='classes-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          {((!old) && (<p>New class</p>)) ||
           ((old) && (<p>Change class</p>))}
          <div className='settings'>
            <div>
              Temp settings
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

export default ClassesPopup;