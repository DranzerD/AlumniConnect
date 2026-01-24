import { Outlet, NavLink } from "react-router-dom";
import './Layout.css';

const Layout = ({ isLoggedin }) => {
  return (
    <>
      <nav style={{ margin: 0 }}>
        <ul className="menu">
          {isLoggedin ? (
            <>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "active" : "inactive")}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Batches"
                  className={({ isActive }) => (isActive ? "active" : "inactive")}
                >
                  Batches
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => (isActive ? "active" : "inactive")}
                >
                  Contact Us
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Feedback"
                  className={({ isActive }) => (isActive ? "active" : "inactive")}
                >
                  Feedback
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "active" : "inactive")}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Login"
                  className={({ isActive }) => (isActive ? "active" : "inactive")}
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => (isActive ? "active" : "inactive")}
                >
                  Contact Us
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
      <Outlet />
    </>
  );
};

export default Layout;