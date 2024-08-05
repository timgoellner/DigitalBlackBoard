import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup'
import { IoMdClose } from "react-icons/io"

import "../../styles/components/modules/DeletePopup.css"

function DeletePopup({ type, refresh }) {
  const [error, setError] = useState('')

  const navigate = useNavigate();

  const [open, setOpen] = useState(false)
  const closeModal = () => {
    setOpen(false)
  }

  function request() {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/register`, {
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
        } else {
          setError(data.message)
        }
      })
  }

  return (
    <>
      <button type="button" className="button" onClick={() => setOpen(o => !o)}>
        Delete organization
      </button>

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='classes-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          <p>Confirm deletion</p>
          <p>When clicking Confirm, all organization data including all accounts will be deleted</p>
          <div>
            <button onClick={() => request()}>Confirm</button>
            <error>{error}</error>
          </div>
        </div>
      </Popup>
    </>
  )
}

export default DeletePopup
