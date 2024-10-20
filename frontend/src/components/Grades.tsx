import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MdAccountTree, MdPeopleAlt } from "react-icons/md";
import { IoLanguageSharp } from "react-icons/io5";

import "../styles/components/Grades.css"

import GradesPopup from './modules/GradesPopup';

function Grades() {
  const [grades, setGrades] = useState<any[]>([])
  const [gradeName, setGradeName] = useState('')
  const [subgradeName, setSubgradeName] = useState('')
  const [order, setOrder] = useState(0)

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token') as string

  const refresh = () => {
    fetch(`https://dbb.timgöllner.de/api/dashboard/grades`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        var gradesList = Object.keys(data.grades).map(key => { return { ...data.grades[key], key } })

        if (order === 1) gradesList = gradesList.sort((a, b) => (b.subgrades !== null && a.subgrades !== null) ? b.subgrades.length - a.subgrades.length : 0)
        else if (order === 2) gradesList = gradesList.sort((a, b) => b.count - a.count)

        gradesList = gradesList.map((grade) => {
          if (
            (gradeName && !grade.key.includes(gradeName.toLowerCase())) ||
            (subgradeName && grade.subgrades === null) ||
            (subgradeName && grade.subgrades.indexOf(subgradeName) === -1)
          ) return null

          if (grade.subgrades !== null) grade.subgrades.sort()

          return (
            <GradesPopup key={grade.id} refresh={refresh} gradeData={grade}/>
          )
        })

        setGrades(gradesList)
      })
  }
  
  useEffect(refresh, [gradeName, subgradeName, order])

  function orderGrades(schema: React.SetStateAction<number>) {
    const buttons = document.getElementsByClassName('order-buttons')[0].children
    for (var i = 0; i < 3; i++) {
      if (i === schema) buttons[i].classList.add('selected')
      else buttons[i].classList.remove('selected')
    }

    setOrder(schema)
  }

  return(
    <div className='grades-component'>
      <div className='grades'>
        {grades}
      </div>
      <div className='actions'>
        <div className='sort'>
          <p>Search options</p>
          <div>
            <p>Grade</p>
            <input
              value={gradeName}
              type="text"
              onChange={(e) => setGradeName(e.target.value)}
            />
          </div>
          <div>
            <p>Subgrade</p>
            <input
              value={subgradeName}
              type="text"
              onChange={(e) => setSubgradeName(e.target.value)}
            />
          </div>
        </div>
        <div className='order'>
          <p>Order options</p>
          <div className='order-buttons'>
            <button className='selected' onClick={() => orderGrades(0)}><IoLanguageSharp /></button>
            <button onClick={() => orderGrades(1)}><MdAccountTree /></button>
            <button onClick={() => orderGrades(2)}><MdPeopleAlt /></button>
          </div>
        </div>
        <hr />
        <GradesPopup refresh={refresh} gradeData={null}/>
      </div>
    </div>
  )
}

export default Grades;