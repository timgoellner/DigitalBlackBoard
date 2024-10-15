async function validateUser() {
  const token = localStorage.getItem('jwt-token')
  if (!token) return false;

  return new Promise((resolve, reject) => {
    fetch('https://dbb.timgöllner.de/api/login', {
      headers: {
        'jwt-token': token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        resolve((data.message === "valid") ? data.user : false)
      } )
    })
}

export default validateUser