import React from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup'
import { IoMdClose } from "react-icons/io"

import "../../styles/components/modules/DeletePopup.css"

function DeletePopup() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false)
  const closeModal = () => {
    setOpen(false)
  }

  function request() {
    const token = localStorage.getItem('jwt-token')
    if (token == null) return

    fetch(`https://dbb.timgöllner.de/api/dashboard/organizations`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'success') {
          setOpen(false)
          localStorage.removeItem('jwt-token')
          navigate('/login')
        }
      })
  }

  return (
    <>
      <button type="button" className="button" onClick={() => setOpen(o => !o)}>
        Delete organization
      </button>

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='delete-popup'>
          <button className="close" onClick={closeModal}><IoMdClose /></button>
          <p>Confirm deletion</p>
          <div>
            <p>When clicking Confirm, all organization data including all accounts will be deleted</p>
            <button onClick={() => request()}>Confirm</button>
          </div>
        </div>
      </Popup>
    </>
  )
}

export default DeletePopup
