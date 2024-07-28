import { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";
import { MdAccountTree, MdPeopleAlt } from "react-icons/md";

import "../../styles/components/modules/GradesPopup.css"

function GradesPopup(props) {
  const [grade, setGrade] = useState('')
  const [subgradesCount, setSubgradesCount] = useState(0)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setGrade('')
    setSubgradesCount(0)
    setError('')
    setOpen(false)
  }

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

    fetch(`http://localhost:100/dashboard/grades`, {
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
          setGrade('')
          setSubgradesCount(0)
          setError('')
          setOpen(false)
          props.refresh()
        } else {
          setError(data.message)
        }
      })
  }

  const old = props.type === 'old'

  var subgrades
  if (old) {
    if (props.grade.subgrades === null) subgrades = 0
    else subgrades = props.grade.subgrades.length
  }

  useEffect(() => {
    if (old) {
      setGrade(props.grade.key)
      setSubgradesCount(subgrades)
    }
  }, [open, old, subgrades])

  return (
    <>
      {((!old) && (
        <button type="button" className="button" onClick={() => setOpen(o => !o)}>
          New Grade     
        </button>
      )) || ((old) && (
        <div className='grade' onClick={() => setOpen(o => !o)}>
          <p>{props.grade.key}</p>
          <span>
            {(props.grade.subgrades !== null) && <p><MdAccountTree />{props.grade.subgrades.map(subgrade => subgrade + " ")}</p> }
            <p><MdPeopleAlt />{props.grade.count}</p>
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
                <button className={(old && subgrades > 0) && 'selected'} onClick={() => setSubgrades(0)}>a</button>
                <button className={(old && subgrades > 1) && 'selected'} onClick={() => setSubgrades(1)}>b</button>
                <button className={(old && subgrades > 2) && 'selected'} onClick={() => setSubgrades(2)}>c</button>
                <button className={(old && subgrades > 3) && 'selected'} onClick={() => setSubgrades(3)}>d</button>
                <button className={(old && subgrades > 4) && 'selected'} onClick={() => setSubgrades(4)}>e</button>
                <button className={(old && subgrades > 5) && 'selected'} onClick={() => setSubgrades(5)}>f</button>
                <button className={(old && subgrades > 6) && 'selected'} onClick={() => setSubgrades(6)}>g</button>
                <button className={(old && subgrades > 7) && 'selected'} onClick={() => setSubgrades(7)}>h</button>
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