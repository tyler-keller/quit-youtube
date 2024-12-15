import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TimeWaste from './components/TimeWaste';

function Navbar() {
    return (
        <div className="navbar">
            <nav className="navbar-container">
                <a href="/">Home</a>
            </nav>
            <hr />
        </div>
    );
}

function Watch() {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');

    if (!videoId) {
        return <h2>Video not found</h2>;
    }

    return (
        <div className="app-container">
            <header className="header">
                quityoutube.com
            </header>
            <div className="video-container">
                <iframe
                    id="responsive-iframe"
                    className="responsive-iframe"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

function Home() {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate("/time-waste");
    };

    return (
        <aside>
            <h1>“We admitted we were powerless over content — that our lives had become unmanageable.”</h1>
            <h1>So, you want to quit YouTube, huh?</h1>
            <p>Let me guess. You've tried and tried and tried and tried. And nothing's ever stuck.</p>
            <p>Follow me. Take your time back.</p>
            <button onClick={handleButtonClick}>Find out how much time you've lost...</button>
            <hr />
            <h1>This is my manifesto:</h1>
            <p>Society fell off.</p>
            <p>We gave dopaminergic stimulation to everyone in the form of an endless stream of content.</p>
            <h2>Despicable.</h2>
            <p>Tech companies have exacerbated the problem. They've designed their platforms to provide you w/ a short, but sweet dopaminergic impulse.</p>
            <img src="https://images.squarespace-cdn.com/content/v1/52ce318fe4b05da9bada2a07/1399389953699-B52GBDO2IFNS1O5KVS62/Neuroblog+Askaneuroscientist+April+2014+figure-2.jpg?format=750w" alt="rat dopamine tings" />
            <h3>Black box neural networks (like the one behind ChatGPT) work behind the scenes to:</h3>
            <strong>recommend. you. content.</strong>
            <h3>Their goal is to:</h3>
            <strong>keep. you. on. the. site. longer.</strong>
            <h3>Their *objective function* is to take your time away.</h3>
            <p>You can't win against that.</p>
            <p>And if you think you can, you're no better than the problem gambler.</p>
            <p>The gambler that goes to the casino everyday, thinking "today's the day."</p>
            <p>If they were being intellectually honest, they'd realize that "the house always wins."</p>
            <p>YouTube and platforms like it are no different.</p>
            <p>That's what this site hopes to address.</p>
            <hr />
            <h1>In order to use this site correctly, you must do the following:</h1>
            <h3>1. Sign into Google above and fully comprehend how much time you've wasted</h3>
            <h3>2. Install a website blocker for YouTube</h3>
            <h3>3. If you have to use YouTube (let's be honest, it can be helpful) then:</h3>
            <h3 className='indent'>3a. Get the video you want to watch</h3>
            <h3 className='indent'>3b. Put the link to the video in your browser </h3>
            <h3 className="indent">
                (ex. <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
                    https://www.youtube.com/watch?v=dQw4w9WgXcQ
                </a>)
            </h3>
            <h3 className='indent'>3c. Put `quit` in front of YouTube </h3>
            <h3 className='indent'>(ex. <a href="https://www.quityoutube.com/watch?v=dQw4w9WgXcQ">https://www.quityoutube.com/watch?v=dQw4w9WgXcQ</a>)</h3>
            <h3>4. Consume reasonably.</h3>
        </aside>
    );
}

function Blocker() {
    return (
        <div>
            <h1>Do one of the two:</h1>
            <h3>1. Edit your `/etc/hosts` file to redirect all YouTube hits to some other site (ex. github.com, linkedin.com, goatse.cx, idgaf)</h3>
            <h3>2.  <a href="https://chromewebstore.google.com/detail/web-site-blocker/aoabjfoanlljmgnohepbkimcekolejjn">Download an extension</a> that serves the same purpose</h3>
            <h4>Note: Remain honest to yourself. This is a key to the purpose of this site. Don't undo these things unless you don't care how your time is spent (Heads up, one day, you are going to die. Do you want to spend the majority of that finite time watching "vines that keep me up at night"?)</h4>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <Navbar />
            <div className='content'>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/watch" element={<Watch />} />
                    <Route path="/blocker" element={<Blocker />} />
                    <Route path="/time-waste" element={<TimeWaste />} />
                </Routes>
            </div>
        </Router>
    );
}