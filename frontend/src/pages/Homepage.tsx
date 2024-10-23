import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IoIosArrowForward } from "react-icons/io";

import "../styles/Homepage.css"

function Homepage() {
  const [organization, setOrganization] = useState('')

  const navigate = useNavigate();

  return (
    <main className='homepage'>
      <header>
        <div className='title'>
          <span>Digital</span>
          <span>Black</span>
          <span>Board</span>
        </div>
        <div className='navigation'>
          <a href='/login'>Login</a>
          <a href='/register'>Register</a>
        </div>
      </header>
      <div className='intro'>
        <span>
          <div className='greeting'>
            <h1>Let's structure your organisation</h1>
            <p>Directly begin by registering</p>
          </div>
          <div className='actions'>
            <p>Organization Name</p>
            <div>
              <div className='registration'>
                <input
                  value={organization}
                  type="text"
                  placeholder='test organization'
                  onChange={(e) => setOrganization(e.target.value)}
                />
                <span onClick={() => navigate('/register?organization=' + organization)}>Register</span>
              </div>
              <span className='seperator'></span>
              <a className='learn-more' href='https://timgöllner.de/posts/2'>Learn More&nbsp;<IoIosArrowForward/></a>
            </div>
          </div>
        </span>
      </div>
    </main>
  );
}

export default Homepage;
