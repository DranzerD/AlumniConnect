import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import './login.css';

const Login = ({ setUsername, setPassword, setIsLoggedin, setGraduationYear, setEmail, setInstitute, setLink }) => {
    const [username, setUsernameCol] = useState('');
    const [password, setPasswordCol] = useState('');
    const [email, setEmailcol] = useState('');
    const [graduationYear, setGraduationYearcol] = useState('');
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
    const [institute, setInstituteCol] = useState('');
    const [link, setLinkcol] = useState('');
    const navigate = useNavigate();

    const styles = {
        page: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f4',
        },
        formContainer: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            width: '300px',
            textAlign: 'center',
        },
        input: {
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
        },
        button: {
            backgroundColor: '#4a7766',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '16px',
        },
        buttonSecondary: {
            backgroundColor: '#ddd',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '16px',
        },
        toggleButton: {
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: '#4a7766',
            cursor: 'pointer',
            textDecoration: 'underline',
        },
    };

    const loginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/signin', { username, password });
            if (response.status === 200) {
                setUsername(username);
                setPassword(password);
                setIsLoggedin(true);
                setGraduationYear(response.data.user.graduationYear);
                setEmail(response.data.user.email);
                setLink(response.data.user.link);
                alert("Login successful!");
                navigate('/');
            }
        } catch (error) {
            console.error("Error details:", error);
            alert("Something went wrong. Please check the console for details.");
        }
    };

    const registerSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/save', { username, password, email, graduationYear, institute, link });
            if (response.status === 200) {
                setUsername(username);
                setPassword(password);
                setGraduationYear(graduationYear);
                setEmail(email);
                setInstitute(institute);
                setLink(link);
                setIsLoggedin(true);
                alert("Registration successful!");
                navigate('/');
            }
        } catch (error) {
            alert("Something went wrong. Please try again.");
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.formContainer}>
                {isLoginFormVisible ? (
                    <form onSubmit={loginSubmit} id="log_form">
                        <input
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsernameCol(e.target.value)}
                            maxLength={20}
                            minLength={3}
                            required
                        /><br />
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPasswordCol(e.target.value)}
                            maxLength={ 20}
                            minLength={3}
                            required
                            autoComplete="off"
                        /><br />
                        <button type="submit" style={styles.button}>Login</button>
                        <button type="button" style={styles.toggleButton} onClick={() => setIsLoginFormVisible(false)}>Register instead</button>
                    </form>
                ) : (
                    <form onSubmit={registerSubmit} id="reg_form">
                        <input
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsernameCol(e.target.value)}
                            maxLength={20}
                            minLength={3}
                            required
                        /><br />
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPasswordCol(e.target.value)}
                            maxLength={20}
                            minLength={3}
                            required
                            autoComplete="off"
                        /><br />
                        <input
                            style={styles.input}
                            placeholder="Email"
                            type='email'
                            onChange={(e) => setEmailcol(e.target.value)}
                            maxLength={20}
                            minLength={3}
                            required
                            autoComplete="off"
                        /><br />
                        <input
                            style={styles.input}
                            placeholder="Institute"
                            onChange={(e) => setInstituteCol(e.target.value)}
                            maxLength={20}
                            minLength={3}
                            required
                        /><br />
                        <input
                            style={styles.input}
                            placeholder="Graduation year"
                            type='number'
                            onChange={(e) => setGraduationYearcol(e.target.value)}
                            maxLength={4}
                            minLength={4}
                            required
                            autoComplete="off"
                        /><br />
                        <input
                            style={styles.input}
                            placeholder="LinkedIn Username"
                            type='text'
                            onChange={(e) => setLinkcol(e.target.value)}
                            required
                            autoComplete="off"
                        /><br />
                        <button type="submit" style={styles.button}>Register</button>
                        <button type="button" style={styles.toggleButton} onClick={() => setIsLoginFormVisible(true)}>Login instead</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;