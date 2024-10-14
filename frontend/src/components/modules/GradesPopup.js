import { useState, useMemo } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";
import { MdAccountTree, MdPeopleAlt } from "react-icons/md";

import "../../styles/components/modules/GradesPopup.css"

function GradesPopup({ type, refresh, gradeData }) {
  const [grade, setGrade] = useState('')
  const [subgradesCount, setSubgradesCount] = useState(0)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  const old = type === 'old'

  useMemo(() => {
    setGrade((old) ? gradeData.key : '')
    setSubgradesCount((!old || gradeData.subgrades === null) ? 0 : gradeData.subgrades.length)
  }, [open])

  function setSubgrades(count) {
    const subgrades = document.getElementsByClassName('subgrades')[0].children
    for (var i = 0; i < 8; i++) {
      if (i <= count && subgradesCount !== (count + 1)) subgrades[i].classList.add('selected')
      else subgrades[i].classList.remove('selected')
    }

    if (subgradesCount === (count + 1)) setSubgradesCount(0)
    else setSubgradesCount(count + 1)
  }

  function request(method) {
    const token = localStorage.getItem('jwt-token')

    fetch(`https://dbb.timgöllner.de/api/dashboard/grades`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ grade, subgradesCount }),
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
          New Grade     
        </button>
      )) || ((old) && (
        <div className='grade' onClick={() => setOpen(o => !o)}>
          <p>{gradeData.key}</p>
          <span>
            {(gradeData.subgrades !== null) && <p><MdAccountTree />{gradeData.subgrades.map(subgrade => subgrade + " ")}</p> }
            <p><MdPeopleAlt />{gradeData.count}</p>
          </span>
        </div>
      ))}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='grades-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          {((!old) && (<p>New grade</p>)) ||
           ((old) && (<p>Change grade</p>))}
          <div className='settings'>
            <div>
              <p>Name</p>
              <input
                value={grade}
                type="text"
                onChange={(e) => (!old) && setGrade(e.target.value)}
              />
            </div>
            <div>
              <p>Subgrades</p>
              <div className='subgrades'>
                <button className={(old && subgradesCount > 0) && 'selected'} onClick={() => setSubgrades(0)}>a</button>
                <button className={(old && subgradesCount > 1) && 'selected'} onClick={() => setSubgrades(1)}>b</button>
                <button className={(old && subgradesCount > 2) && 'selected'} onClick={() => setSubgrades(2)}>c</button>
                <button className={(old && subgradesCount > 3) && 'selected'} onClick={() => setSubgrades(3)}>d</button>
                <button className={(old && subgradesCount > 4) && 'selected'} onClick={() => setSubgrades(4)}>e</button>
                <button className={(old && subgradesCount > 5) && 'selected'} onClick={() => setSubgrades(5)}>f</button>
                <button className={(old && subgradesCount > 6) && 'selected'} onClick={() => setSubgrades(6)}>g</button>
                <button className={(old && subgradesCount > 7) && 'selected'} onClick={() => setSubgrades(7)}>h</button>
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

export default GradesPopup;