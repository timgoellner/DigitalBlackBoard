import { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";

import "../../styles/components/modules/AccountsPopup.css"

function AccountsPopup({ type, refresh, account }) {
  const [identifier, setIndentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  const old = type === 'old'

  useEffect(() => {
    if (open) {
      if (old) {
        setIndentifier(account.identifier)
      } else setIndentifier('')

      setPassword('')
      setConfirmPassword('')
    }
  }, [open, old, account])

  function request(method) {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/accounts`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ identifier, password, confirmPassword, id: (old) ? account.id : null }),
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
          New staff account
        </button>
      )) || ((old) && (
        <tr className='account' onClick={() => setOpen(o => !o)}>
          <th>{account.identifier}</th>
        </tr>
      ))}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='accounts-popup'>
          <a href className="close" onClick={closeModal}><IoMdClose /></a>
          {((!old) && (<p>New staff account</p>)) ||
           ((old) && (<p>Change staff account</p>))}
          <div className='settings'>
            <div>
              <p>Identifier</p>
              <input
                value={identifier}
                type="text"
                onChange={(e) => (!old) && setIndentifier(e.target.value)}
              />
            </div>
            <div className='multi'>
              <div>
                <p>Password</p>
                <input
                  value={password}
                  type="text"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <p>Confirm password</p>
                <input
                  value={confirmPassword}
                  type="text"
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

export default AccountsPopup;