import logo from './logo.svg';
import './App.css';
import { Component } from 'react';
import { Route, BrowserRouter, Routes  } from 'react-router-dom'
import Login  from './pages/Enter/login'
import Layout from './pages/navigation/Layout'
import Home from './pages/Enter/home'
import axios from 'axios'

function App() {
  
  return (<BrowserRouter >

    <Routes>
      <Route path = '/' element = {<Layout />} />
      <Route index element = {<Home />} />
      <Route path = 'Login' element = { <Login/> }  />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
