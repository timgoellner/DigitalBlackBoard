import React from 'react';
import ReactDOM, { Container } from 'react-dom/client';

import { createBrowserRouter, createRoutesFromElements, redirect, Route, RouterProvider } from "react-router-dom";

import './styles/index.css';

import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Blackboard from './pages/Blackboard';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

import validateUser from './helpers/validateUser';
import { User } from './pages/Dashboard';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path = '/' element = {<Homepage />} loader = {async () => {
        const user = await validateUser() as User

        if (user && !user.isStaff) return redirect('/blackboard')
        else if (user && user.isStaff) return redirect('/dashboard')
        else return null
      }}/>

      <Route path = '/login' element = {<Login />} loader = {async () => {
        const user = await validateUser() as User

        if (user && !user.isStaff) return redirect('/blackboard')
        else if (user && user.isStaff) return redirect('/dashboard')
        else return null
      }}/>

      <Route path = '/register' element = {<Register />} loader = {async () => {
        const user = await validateUser() as User

        if (user && !user.isStaff) return redirect('/blackboard')
        else if (user && user.isStaff) return redirect('/dashboard')
        else return null
      }}/>

      <Route path = '/blackboard' element = {<Blackboard />} loader = {async () => {
        const user = await validateUser() as User

        if (!user || user.isStaff) return redirect('/login')
        else return user
      }}/>

      <Route path = '/dashboard' element = {<Dashboard />} loader = {async () => {
        const user = await validateUser() as User

        if (!user || !user.isStaff) return redirect('/login')
        else return user
      }}/>

      <Route path = '*' element = {<NotFound />} />
    </>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root') as Container);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);