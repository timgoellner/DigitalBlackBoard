import React from 'react';
import ReactDOM from 'react-dom/client';

import { createBrowserRouter, createRoutesFromElements, redirect, Route, RouterProvider } from "react-router-dom";

import './styles/index.css';

import App from './pages/App';
import Authenticate from './pages/Login';
import Blackboard from './pages/Blackboard';
import Dashboard from './pages/Dashboard';

import validateUser from './helpers/validateUser';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path = '/' element = {<App />} loader = {async () => {
        if (await validateUser()) return redirect('/blackboard')
        else return redirect('/login')
      }}/>

      <Route path = '/login' element = {<Authenticate />} loader = {async () => {
        if (await validateUser()) return redirect('/blackboard')
        else return null
      }}/>

      <Route path = '/blackboard' element = {<Blackboard />} loader = {async () => {
        if (!await validateUser()) return redirect('/login')
        else return null
      }}/>

      <Route path = '/dashboard' element = {<Dashboard />} loader = {async () => {
        if (!await validateUser()) return redirect('/login')
        else return null
      }}/>
    </>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);