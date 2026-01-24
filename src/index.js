import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login  from './pages/Enter/login'
import Layout from './pages/navigation/Layout'
import Home from './pages/Enter/home'
import { useState } from 'react'
import AlumniPage from "./pages/Social/Alumni";
import BatchList from "./pages/Social/BatchList";
import Feedback from "./pages/Social/Feedback";
import ContactUs from "./pages/Social/ContactUs";

//import AlumniDashboard from "./pages/Social/dashboard";

export default function App() {
  const [ username, setUsername ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ isLoggedin, setIsLoggedin ] = useState(false)
  const [ graduationYear, setGraduationYear ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ institute, setInstitute] = useState('')
  const [ link, setLink ] = useState('')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout isLoggedin={isLoggedin} />}>
          <Route index element={<Home isLoggedin={isLoggedin} username = {username} graduationYear = {graduationYear} email = {email} institute = {institute} />} />
          <Route path="Login" element={<Login setUsername = {setUsername} setPassword = {setPassword} setIsLoggedin = {setIsLoggedin} setGraduationYear = {setGraduationYear} setEmail = {setEmail} setInstitute={setInstitute} setLink = {setLink} />} />
          <Route path= "Batches" element = {<BatchList/>} />
          <Route path="alumni/:batch" element={<AlumniPage />} />
          <Route path = "feedback" element = {<Feedback />} />
          <Route path = "contact" element = {<ContactUs/>}/> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);