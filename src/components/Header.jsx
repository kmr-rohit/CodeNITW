import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import Codeit from "../images/codeIt3.png";

export default function Header() {
  const [pageState, setPageState] = useState("sign-in");
  const [displayPageName, setDisplayPageName] = useState("Sign in");
  const [user, setUser] = useState(null); // Add user state to keep track of authentication state
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const auth = getAuth();
  const userEmail = user && user.email;
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState("Dashboard");
        setDisplayPageName("Dashboard");
      } else {
        setPageState("sign-in");
        setDisplayPageName("Sign in");
      }
      setUser(user);
    });
  }, [auth]);

  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  function isPath(route) {
    return route === location.pathname;
  }

  // Function to handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/sign-in");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <div>
      <header>
        <nav className="bg-gray-200 border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <a href="" className="flex items-center">
              <img
                src={Codeit}
                className="mr-3 h-8 sm:h-12 lg:h-14"
                alt="Flowbite Logo"
              />
            </a>
            <div className="flex items-center lg:order-2">
              <button
                data-collapse-toggle="mobile-menu-2"
                type="button"
                className="inline-flex items-center p-2 ml-1 text-sm text-black-500 rounded-lg lg:hidden hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-200 dark:text-black-200 dark:hover:bg-black-200 dark:focus:bg-black-200"
                onClick={toggleMenu}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className={`${menuOpen ? 'hidden' : 'block'}`}
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"
                  ></path>
                  <path
                    className={`${menuOpen ? 'block' : 'hidden'}`}
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6 4h12v2H6zm0 5h12v2H6zm0 5h12v2H6z"
                  ></path>
                </svg>
              </button>
            </div>
            <div
              className={`${
                menuOpen ? 'block' : 'hidden'
              } justify-between items-center w-full lg:flex lg:w-auto lg:order-1`}
              id="mobile-menu-2"
            >
              <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                <li
                  onClick={() => navigate("/resources")}
                 className={`block py-2 pr-4 pl-3  hover:text-gray-600  hover:mt-1  border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0   ${
                    isActive("/resources")
                    ? "text-gray-600 font-extrabold text-lg mt-1"
                      : "text-gray-500"
                  }`}
                >
                  PROBLEMS
                </li>
                {(userEmail === 'sc922055@student.nitw.ac.in' || userEmail === 'rr7433446@gmail.com') && (
                  <li
                    onClick={() => navigate("/add-contest")}
                    className={`block py-2 pr-4 pl-3 hover:text-gray-600    border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0   ${
                    isActive("/add-contest")
                    ? "text-gray-600 font-extrabold text-lg mt-1"
                      : "text-gray-500"
                  }`}
                >
                  ADD CONTEST
                </li>
                )}
                <li
                  onClick={() => navigate("/contest")}
                  className={`block py-2 pr-4 pl-3  hover:text-gray-600    border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0   ${
                    isActive("/contest")
                    ? "text-gray-600 font-extrabold text-lg mt-1"
                    : "text-gray-500"
                  }`}
                >
                  CONTESTS
                </li>
                <li
                  onClick={() => navigate("/leaderboard")}
                  className={`block py-2 pr-4 pl-3 hover:text-gray-600    border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0   ${
                    isActive("/leaderboard")
                      ? "text-gray-600 font-extrabold text-lg mt-1"
                      : "text-gray-500"
                  }`}
                >
                  LEADERBOARD
                </li>
                <li
                  onClick={() => navigate(pageState)}
                  className={`block py-2 pr-4 pl-3  hover:text-gray-600    border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0   ${
                    isPath("/Dashboard")
                    ? "text-gray-600 font-extrabold text-lg mt-1"
                    : "text-gray-500"
                  }`}
                >
                  DASHBOARD
                </li>
                {/* {user && user.email ? ( */}
                  <li
                    onClick={handleLogout}
                    className={`block py-2 pr-4 pl-3 text-gray-500  hover:text-gray-600  h  border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 `} >
                    {isPath('/sign-in') ? "SIGN IN" : isPath('/sign-up') ? "SIGN UP" : "LOG OUT"}
                  </li>
                {/* ) : null} */}
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}