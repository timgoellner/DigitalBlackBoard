import React from 'react';
import { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';

import { IoMdClose } from "react-icons/io";

import "../../styles/components/modules/AccountsPopup.css"

type Account = {
  id: number,
  organization: string,
  identifier: string,
  password: string,
  isStaff: boolean
}

type Props = {
  refresh: Function,
  account: Account | null
}

function AccountsPopup({ refresh, account }: Props) {
  const [identifier, setIndentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setError('')
    setOpen(false)
  }

  useEffect(() => {
    if (open) {
      if (account !== null) {
        setIndentifier(account.identifier)
      } else setIndentifier('')

      setPassword('')
      setConfirmPassword('')
    }
  }, [open, account])

  function request(method: string) {
    const token = localStorage.getItem('jwt-token')
    if (token == null) return

    fetch(`https://dbb.timgöllner.de/api/dashboard/accounts`, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ identifier, password, confirmPassword, id: (account !== null) ? account.id : null }),
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
      {(account === null) ? (
        <button type="button" className="button" onClick={() => setOpen(o => !o)}>
          New staff account
        </button>
      ) : (
        <tr className='account' onClick={() => setOpen(o => !o)}>
          <th>{account.identifier}</th>
        </tr>
      )}

      <Popup open={open} closeOnDocumentClick onClose={closeModal}>
        <div className='accounts-popup'>
          <button className="close" onClick={closeModal}><IoMdClose /></button>
          {(account === null) ? (<p>New staff account</p>) : (<p>Change staff account</p>)}
          <div className='settings'>
            <div>
              <p>Identifier</p>
              <input
                value={identifier}
                type="text"
                onChange={(e) => (account === null) && setIndentifier(e.target.value)}
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
            <div className={(account !== null) ? 'actions old' : 'actions'}>
              {(account === null) ? (
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

export default AccountsPopup;
export { Account }
