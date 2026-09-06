import { useState } from 'react'
import { Link } from "react-router-dom";
import FindJobs from './public/FindJobs';
import Login from "./public/Login.jsx";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header>
        <h1>JobHunt</h1>
        <nav>
          <ul>
            <li> <Link to="/find-jobs">Find Jobs</Link></li>
            <li> <Link to="/find-jobs">Browse Jobs</Link></li>
          </ul>
        </nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </header>
      <main>
        <section className="left-hero">
          <h1>
            Discover
            <br />
            more than
            <br />
            <span>5000+ Jobs</span>
          </h1>
          <p>Great opportunities await you! go and hunt for your dream job</p>
        </section>
        <section className="right-hero">
          <img src="/right hero.jpg" alt="Job Search" />
        </section>
        <div className="search-bar">
          <input type="text" placeholder="Job title or keyword" />
          <input type="text" placeholder="Location" />
          <button>Search</button>
        </div>
        <p>Showing 10 results for "Software Engineer"</p>
        <section className="job-listings">
          <h3>Companies we helped to grow</h3>
          <img src="" alt="vodafone" />
          <img src="" alt="intel" />
          <img src="" alt="tesla" />
          <img src="" alt="amd" />
          <img src="" alt="talkit" />
          <img src="" alt="amazon" />
        </section>
        <section className="category">
          <h3>Browse by category</h3>
          <span>View all</span>
          <div className='category'>
            <div className='category-block'>
              <img src="" alt="design" />
              <h4>Design</h4>
              <p>show available jobs</p>
            </div>
            <div className='category-block'>
              <img src="" alt="sales" />
              <h4>Sales</h4>
              <p>show available jobs</p>
            </div>
            <div className='category-block'>
              <img src="" alt="marketing" />
              <h4>Marketing</h4>
              <p>show available jobs</p>
            </div>
            <div className='category-block'>
              <img src="" alt="finance" />
              <h4>Finance</h4>
              <p>show available jobs</p>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <p>&copy; 2023 JobHunt. All rights reserved.</p>
        <section className="home">
          <a href="./Home.jsx">Home</a>
          <a href="./About.jsx">About</a>
          <a href="./Contact.jsx">Contact</a>
        </section>
        <section className="social-media">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">LinkedIn</a>
        </section>
      </footer>
    </>
  )
}

export default App
