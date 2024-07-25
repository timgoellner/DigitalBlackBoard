import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Grades() {
  const [grades, setGrades] = useState([])

  const navigate = useNavigate();

  const token = localStorage.getItem('jwt-token')

  useEffect(() => {
    fetch(`http://localhost:100/dashboard/grades`, { headers: { 'jwt-token': token } })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') navigate('/login')

        const gradesList = <div>{
          data.grades.map(grade => <h1>{grade.grade}{grade.hasSubgrade && grade.subgrade}</h1> )
        }</div>

        console.log(gradesList)

        setGrades(gradesList)
      })
  }, [])

  return(
    <div className="grades">
      {grades}
    </div>
  )
}

export default Grades;