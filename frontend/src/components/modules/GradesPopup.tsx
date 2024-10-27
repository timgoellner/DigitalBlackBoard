import React, { useState, useMemo } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";
import { MdAccountTree, MdPeopleAlt } from "react-icons/md";

import "../../styles/components/modules/GradesPopup.css"

type Grade = {
  key: string,
  id: string,
  subgrades: string[] | null,
  count: string
}

type Props = {
  refresh: Function,
  gradeData: Grade | null
}

function GradesPopup({ refresh, gradeData }: Props) {
  const [grade, setGrade] = useState('')
  const [subgradesCount, setSubgradesCount] = useState(0)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  useMemo(() => {
    setGrade((gradeData !== null) ? gradeData.key : '')
    setSubgradesCount((gradeData === null || gradeData.subgrades === null) ? 0 : gradeData.subgrades.length)
  }, [open])

  function setSubgrades(count: number) {
    const subgrades = document.getElementsByClassName('subgrades')[0].children
    for (var i = 0; i < 8; i++) {
      if (i <= count && subgradesCount !== (count + 1)) subgrades[i].classList.add('selected')
      else subgrades[i].classList.remove('selected')
    }

    if (subgradesCount === (count + 1)) setSubgradesCount(0)
    else setSubgradesCount(count + 1)
  }

  function request(method: string) {
    const token = localStorage.getItem('jwt-token')
    if (token == null) return

    fetch(`https://dbb.timgöllner.de/api/v1/dashboard/grades`, {
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
      {(gradeData === null) ? (
        <button type="button" className="button" onClick={() => setOpen(o => !o)}>
          New Grade     
        </button>
      ) : (
        <div className='grade' onClick={() => setOpen(o => !o)}>
          <p>{gradeData.key}</p>
          <span>
            {(gradeData.subgrades !== null) && <p><MdAccountTree />{gradeData.subgrades.map(subgrade => subgrade + " ")}</p> }
            <p><MdPeopleAlt />{gradeData.count}</p>
          </span>
        </div>
      )}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='grades-popup'>
          <button className="close" onClick={closeModal}><IoMdClose /></button>
          {(gradeData === null) ? (<p>New grade</p>) : (<p>Change grade</p>)}
          <div className='settings'>
            <div>
              <p>Name</p>
              <input
                value={grade}
                type="text"
                onChange={(e) => (gradeData === null) && setGrade(e.target.value)}
              />
            </div>
            <div>
              <p>Subgrades</p>
              <div className='subgrades'>
                <button className={((gradeData !== null) && subgradesCount > 0) ? 'selected' : ""} onClick={() => setSubgrades(0)}>a</button>
                <button className={((gradeData !== null) && subgradesCount > 1) ? 'selected' : ""} onClick={() => setSubgrades(1)}>b</button>
                <button className={((gradeData !== null) && subgradesCount > 2) ? 'selected' : ""} onClick={() => setSubgrades(2)}>c</button>
                <button className={((gradeData !== null) && subgradesCount > 3) ? 'selected' : ""} onClick={() => setSubgrades(3)}>d</button>
                <button className={((gradeData !== null) && subgradesCount > 4) ? 'selected' : ""} onClick={() => setSubgrades(4)}>e</button>
                <button className={((gradeData !== null) && subgradesCount > 5) ? 'selected' : ""} onClick={() => setSubgrades(5)}>f</button>
                <button className={((gradeData !== null) && subgradesCount > 6) ? 'selected' : ""} onClick={() => setSubgrades(6)}>g</button>
                <button className={((gradeData !== null) && subgradesCount > 7) ? 'selected' : ""} onClick={() => setSubgrades(7)}>h</button>
              </div>
            </div>
          </div>
          <div className='footer'>
            <div className={(gradeData !== null) ? 'actions old' : 'actions'}>
              {(gradeData === null) ? (
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

export default GradesPopup;