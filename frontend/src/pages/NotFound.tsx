import React from 'react'

import "../styles/NotFound.css"

function NotFound() {
  return (
    <main className='not-found'>
      <h1>404 - Not Found</h1>
      <p>The resource at <i>{window.location.href}</i> doesn't exist.</p>
    </main>
  );
}

export default NotFound;
