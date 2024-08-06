import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import "../styles/components/Settings.css"

import AccountsPopup from './modules/AccountsPopup';
import DeletePopup from './modules/DeletePopup'

function Settings() {
  const [accounts, setAccounts] = useState([])
  const [identifier, setIndentifier] = useState('')
  const [news, setNews] = useState('')
  const [quarantine, setQuarantine] = useState(false)

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token')

  const load = () => {
    fetch(`http://localhost:100/dashboard/organizations`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var organizationData = data.organization

        setNews(organizationData.news)
        setQuarantine(organizationData.quarantine)
      })
  }

  useEffect(load, [])

  const refresh = () => {
    fetch(`http://localhost:100/dashboard/accounts`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var accountsList = data.accounts

        accountsList = accountsList.map((account) => {
          if ((identifier && !account.identifier.toLowerCase().includes(identifier))) return null

          return <AccountsPopup key={account.id} type={'old'} refresh={refresh} account={account}/>
        })

        setAccounts(accountsList)
      })
  }
  
  useEffect(refresh, [identifier])

  const request = () => {
    const token = localStorage.getItem('jwt-token')

    fetch(`http://localhost:100/dashboard/organizations`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ news, quarantine }),
    })
  }


  return(
    <div className='settings-component'>
      <div className='accounts-zone'>
        <p>Staff Accounts</p>
        <div className='accounts-search'>
          <input
            value={identifier}
            type="text"
            placeholder='Identifier'
            onChange={(e) => setIndentifier(e.target.value)}
          />
          <table className='accounts'>
            {accounts}
          </table>
        </div>
        <div className='actions'>
          <AccountsPopup type={'new'} refresh={refresh}/>
        </div>
      </div>
      <div className='danger-zone'>
        <p>Global Actions</p>
        <div className='settings'>
          <div className='news'>
            <p>News</p>
            <input
              value={news}
              type="text"
              onChange={(e) => setNews(e.target.value)}
            />
          </div>
          <div className='quarantine'>
            <p>Quarantine Mode</p>
            <p>Blocks user accounts from loggin in</p>
            <div className='quarantine-switch'>
              <button className={(!quarantine && 'selected') + ' switch'} onClick={() => setQuarantine(false)}>OFF</button>
              <button className={(quarantine && 'selected') + ' switch'} onClick={() => setQuarantine(true)}>ON</button>
            </div>
          </div>
          <div className='submit'>
            <button onClick={request}>Save</button>
          </div>
        </div>
        <div className='delete'>
          <p>Delete Organization</p>
          <DeletePopup />
        </div>
      </div>
    </div>
  )
}

export default Settings;