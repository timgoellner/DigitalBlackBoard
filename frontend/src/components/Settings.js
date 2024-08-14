import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { IoMdClose } from "react-icons/io"

import "../styles/components/Settings.css"

import AccountsPopup from './modules/AccountsPopup';
import DeletePopup from './modules/DeletePopup'

function Settings() {
  const [accounts, setAccounts] = useState([])
  const [identifier, setIndentifier] = useState('')
  const [news, setNews] = useState('')
  const [quarantine, setQuarantine] = useState(false)
  const [response, setResponse] = useState('')

  const [subjects, setSubjects] = useState([])
  const [subject, setSubject] = useState('')
  const [currentSubject, setCurrentSubject] = useState('')

  const [rooms, setRooms] = useState([])
  const [room, setRoom] = useState('')
  const [currentRoom, setCurrentRoom] = useState('')

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token')

  const load = () => {
    fetch(`http://localhost:5001/dashboard/organizations`, { headers: { 'jwt-token': token } })
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
    fetch(`http://localhost:5001/dashboard/accounts`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var accountsList = data.accounts

        accountsList = accountsList.map((account) => {
          if (identifier && !account.identifier.toLowerCase().includes(identifier)) return null

          return <AccountsPopup key={account.id} type={'old'} refresh={refresh} account={account}/>
        })

        setAccounts(accountsList)
      })
  }
  
  useEffect(refresh, [identifier])

  const subjectsRequest = () => {
    fetch(`http://localhost:5001/dashboard/subjects`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var subjectsList = data.subjects

        subjectsList = subjectsList.filter((subjectElement) => {
          return !(subject && !subjectElement.toLowerCase().includes(subject))
        })

        setSubjects(subjectsList)
      })
  }

  useEffect(subjectsRequest, [subject])

  const roomsRequest = () => {
    fetch(`http://localhost:5001/dashboard/rooms`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var roomsList = data.rooms

        roomsList = roomsList.filter((roomElement) => {
          return !(room && !roomElement.includes(room))
        })

        setRooms(roomsList)
      })
  }

  useEffect(roomsRequest, [room])

  const request = async () => {
    fetch(`http://localhost:5001/dashboard/organizations`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ news, quarantine }),
    })
      .then((response) => response.json())
      .then((data) => { setResponse(data.message) })
  }

  async function handleKeyRoom(e) {
    if (e.keyCode === 13 && e.target.value && !(/^\s*$/.test(e.target.value)) && e.target.value.length < 40) {
      setCurrentRoom('')

      await fetch(`http://localhost:5001/dashboard/rooms`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'jwt-token': token
        },
        body: JSON.stringify({ room: e.target.value }),
      })

      roomsRequest()
    }
  }

  async function deleteRoom(room) {
    await fetch(`http://localhost:5001/dashboard/rooms`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ room }),
    })

    roomsRequest()
  }

  async function handleKeySubject(e) {
    if (e.keyCode === 13 && e.target.value && !(/^\s*$/.test(e.target.value)) && e.target.value.length < 40) {
      setCurrentSubject('')

      await fetch(`http://localhost:5001/dashboard/subjects`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'jwt-token': token
        },
        body: JSON.stringify({ subject: e.target.value }),
      })

      subjectsRequest()
    }
  }

  async function deleteSubject(subject) {
    await fetch(`http://localhost:5001/dashboard/subjects`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        'jwt-token': token
      },
      body: JSON.stringify({ subject }),
    })

    subjectsRequest()
  }


  return(
    <div className='settings-component'>
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
            <button onClick={() => {
              request()
              setTimeout(() => {
                  setResponse('')
              }, 3000);
            }}>Save</button>
            <p className='response'>{response}</p>
          </div>
        </div>
        <div className='delete'>
          <p>Delete Organization</p>
          <DeletePopup />
        </div>
      </div>
      <div className='accounts-zone'>
        <p>Staff Accounts</p>
        <div className='search'>
          <input
            value={identifier}
            type="text"
            placeholder='Identifier'
            onChange={(e) => setIndentifier(e.target.value)}
          />
          <table className='list'>
            {accounts}
          </table>
        </div>
        <div className='actions'>
          <AccountsPopup type={'new'} refresh={refresh}/>
        </div>
      </div>
      <div className='subjects-zone'>
        <p>Subjects</p>
        <div className='search'>
          <input
            value={subject}
            type="text"
            placeholder='Subject'
            onChange={(e) => setSubject(e.target.value)}
          />
          <table className='list'>
            {subjects.map((subject) => (
              <tr value={subject} className='small-element'>
                <p>{subject}</p>
                <a href onClick={() => deleteSubject(subject)}><IoMdClose /></a>
              </tr>
            ))}
          </table>
        </div>
        <input
          value={currentSubject}
          type="text"
          onChange={(e) => setCurrentSubject(e.target.value)}
          onKeyUp={(e) => handleKeySubject(e)}
        />
      </div>
      <div className='rooms-zone'>
        <p>Rooms</p>
        <div className='search'>
          <input
            value={room}
            type="text"
            placeholder='Room'
            onChange={(e) => setRoom(e.target.value)}
          />
          <table className='list'>
            {rooms.map((room) => (
              <tr value={room} className='small-element'>
                <p>{room}</p>
                <a href onClick={() => deleteRoom(room)}><IoMdClose /></a>
              </tr>
            ))}
          </table>
        </div>
        <input
          value={currentRoom}
          type="text"
          onChange={(e) => setCurrentRoom(e.target.value)}
          onKeyUp={(e) => handleKeyRoom(e)}
        />
      </div>
    </div>
  )
}

export default Settings;