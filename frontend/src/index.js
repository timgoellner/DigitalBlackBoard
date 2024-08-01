import React from 'react';
import ReactDOM from 'react-dom/client';

import { createBrowserRouter, createRoutesFromElements, redirect, Route, RouterProvider } from "react-router-dom";

import './styles/index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Blackboard from './pages/Blackboard';
import Dashboard from './pages/Dashboard';

import validateUser from './helpers/validateUser';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path = '/' loader = {async () => {
        const user = await validateUser();

        if (user && !user.isStaff) return redirect('/blackboard')
        else if (user && user.isStaff) return redirect('/dashboard')
        else return redirect('/login')
      }}/>

      <Route path = '/login' element = {<Login />} loader = {async () => {
        const user = await validateUser();

        if (user && !user.isStaff) return redirect('/blackboard')
        else if (user && user.isStaff) return redirect('/dashboard')
        else return null
      }}/>

      <Route path = '/register' element = {<Register />} loader = {async () => {
        const user = await validateUser();

        if (user && !user.isStaff) return redirect('/blackboard')
        else if (user && user.isStaff) return redirect('/dashboard')
        else return null
      }}/>

      <Route path = '/blackboard' element = {<Blackboard />} loader = {async () => {
        const user = await validateUser();

        if (!user || user.isStaff) return redirect('/login')
        else return user
      }}/>

      <Route path = '/dashboard' element = {<Dashboard />} loader = {async () => {
        const user = await validateUser();

        if (!user || !user.isStaff) return redirect('/login')
        else return user
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