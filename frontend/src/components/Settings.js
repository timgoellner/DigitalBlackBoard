import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import "../styles/components/Settings.css"

import AccountsPopup from './modules/AccountsPopup';
import DeletePopup from './modules/DeletePopup'

function Settings() {
  const [accounts, setAccounts] = useState([])
  const [identifier, setIndentifier] = useState('')
  const [news, setNews] = useState('')

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token')

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

  function saveNews() {

  }

  function setQuarantine(value) {

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
        <div>
          <div>
            <p>News</p>
            <input
              value={news}
              type="text"
              onChange={(e) => setNews(e.target.value)}
            />
          </div>
          <button onClick={saveNews()}>Save</button>
        </div>
        <div>
          <div>
            <p>Quarantine Mode</p>
            <div className='quarantine-switch'>
              <button className='selected' onClick={setQuarantine(false)}></button>
              <button onClick={setQuarantine(true)}></button>
            </div>
          </div>
          <p>Blocks user accounts from loggin in</p>
        </div>
        <div>
          <p>Delete Organization</p>
          <DeletePopup />
        </div>
      </div>
    </div>
  )
}

export default Settings;