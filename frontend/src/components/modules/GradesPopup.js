import { useState } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";

import "../../styles/components/modules/GradesPopup.css"

function GradesPopup(props) {
  const [newGrade, setNewGrade] = useState('')
  const [subgradesCount, setSubgradesCount] = useState(0)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setNewGrade('')
    setSubgradesCount(0)
    setError('')
    setOpen(false)
  };

  function setSubgrades(count) {
    const subgrades = document.getElementsByClassName('subgrades')[0].children
    for (var i = 0; i < 8; i++) {
      if (i <= count && subgradesCount !== (count + 1)) subgrades[i].classList.add('selected')
      else subgrades[i].classList.remove('selected')
    }

    if (subgradesCount === (count + 1)) setSubgradesCount(0)
    else setSubgradesCount(count + 1)
  }

  function createGrade() {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/grades`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ newGrade, subgradesCount }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'success') {
          setNewGrade('')
          setSubgrades(0)
          setError('')
          setOpen(false)
          props.refresh()
        } else {
          setError(data.message)
        }
      })
  }

  return (
    <>
      <button type="button" className="button" onClick={() => setOpen(o => !o)}>
        New Grade     
      </button>
      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='grades-popup'>
          <a className="close" onClick={closeModal}><IoMdClose /></a>
          <p>New grade</p>
          <div className='settings'>
            <div>
              <p>Name</p>
              <input
                value={newGrade}
                type="text"
                onChange={(e) => setNewGrade(e.target.value)}
              />
            </div>
            <div>
              <p>Subgrades</p>
              <div className='subgrades'>
                <button onClick={() => setSubgrades(0)}>a</button>
                <button onClick={() => setSubgrades(1)}>b</button>
                <button onClick={() => setSubgrades(2)}>c</button>
                <button onClick={() => setSubgrades(3)}>d</button>
                <button onClick={() => setSubgrades(4)}>e</button>
                <button onClick={() => setSubgrades(5)}>f</button>
                <button onClick={() => setSubgrades(6)}>g</button>
                <button onClick={() => setSubgrades(7)}>h</button>
              </div>
            </div>
          </div>
          <div className='create'>
            <button onClick={() => createGrade()}>Create</button>
            <error>{error}</error>
          </div>
        </div>
      </Popup>
    </>
  )
}

export default GradesPopup;