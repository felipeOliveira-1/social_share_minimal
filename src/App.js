import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="blog-header">
        <h1>AI & Tech Insights</h1>
        <p>Exploring the Future of Technology and Artificial Intelligence</p>
      </header>

      <main className="blog-container">
        <article className="blog-post">
          <h2>Exploring the Future of AI and Cryptocurrencies</h2>
          <p className="post-meta">January 1, 2025 | 5 min read</p>
          <img src="https://source.unsplash.com/800x400/?ai,cryptocurrency" alt="AI and Cryptocurrency" className="post-image" />
          <div className="post-content">
            <p>The intersection of artificial intelligence and cryptocurrencies is shaping up to be one of the most exciting technological frontiers of our time. As AI systems become more sophisticated, they're finding new applications in the world of decentralized finance and blockchain technology...</p>
            <a href="#" className="read-more">Continue reading</a>
          </div>
          <div className="share-container">
            <span className="share-label">Share this article</span>
            <div className="share-buttons">
              <button className="share-btn facebook" aria-label="Share on Facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="share-btn linkedin" aria-label="Share on LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </button>
              <button className="share-btn whatsapp" aria-label="Share on WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </button>
            </div>
          </div>
        </article>
      </main>

      <footer className="blog-footer">
        <p>&copy; 2025 AI & Tech Insights. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
