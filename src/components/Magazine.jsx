import React, { useState, useEffect } from 'react';
import { Search, Calendar, TrendingUp, Tag, Mail, WifiOff } from 'lucide-react';

const Magazine = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchSpaceNews = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles?limit=11');
        const data = await response.json();
        setArticles(data.results || []);
      } catch (err) {
        console.error('API Fetch Error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceNews();
  }, []);

  const filteredArticles = articles.filter((art) =>
    art.title.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  const featured = filteredArticles[0];
  const subArticles = filteredArticles.slice(1);

  return (
    <div className="page-content">
      <nav className="mag-nav">
        <div className="mag-title-area">
          <h1>Cosmic Chronicle</h1>
          <p>Real-time telemetry and news curated from global space agencies.</p>
        </div>

        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Filter articles by title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </nav>

      <div className="editorial-grid">
        <div className="article-feed">
          {loading ? (
            <div className="loader"></div>
          ) : error ? (
            <div className="no-results">
              <WifiOff style={{ width: '40px', height: '40px', color: 'var(--text-tertiary)' }} />
              <h3>Connection Error</h3>
              <p>Unable to connect to the Space News network. Please try again later.</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="no-results">
              <Search style={{ width: '40px', height: '40px', color: 'var(--text-tertiary)' }} />
              <h3>No articles found</h3>
              <p>No recent news matching "{searchText}". Try a different term.</p>
            </div>
          ) : (
            <>
              {featured && (
                <a
                  href={featured.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="featured-post"
                >
                  <div className="featured-post-bg">
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                  </div>
                  <div className="featured-post-overlay"></div>
                  <div className="featured-content">
                    <div className="post-meta">
                      <span className="meta-tag">{featured.news_site}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />{' '}
                        {new Date(featured.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="featured-title">{featured.title}</h2>
                    <p className="featured-excerpt">{featured.summary}</p>
                  </div>
                </a>
              )}

              {subArticles.length > 0 && (
                <div className="sub-articles-grid">
                  {subArticles.map((art) => (
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-card"
                      key={art.id}
                    >
                      <div className="article-img-wrapper">
                        <img
                          src={art.image_url}
                          alt={art.title}
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <div className="article-meta">
                        <span className="cat">{art.news_site}</span>
                        <span>
                          {new Date(art.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="article-title">{art.title}</h3>
                      <p className="article-excerpt">{art.summary}</p>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <aside className="magazine-sidebar">
          <div>
            <h3 className="sidebar-section-title">
              <TrendingUp size={18} style={{ marginRight: '8px' }} /> Top Trending Topics
            </h3>
            <div className="trending-list">
              <div className="trending-item">
                <div className="trending-num">01</div>
                <div className="trending-info">
                  <h4 className="trending-title">Betelgeuse Dimming: Is a Supernova Imminent?</h4>
                  <div className="trending-meta">
                    <Tag size={10} style={{ marginRight: '4px' }} /> Stellar Physics
                  </div>
                </div>
              </div>
              <div className="trending-item">
                <div className="trending-num">02</div>
                <div className="trending-info">
                  <h4 className="trending-title">Amateur Astronomer Discovers New Comet</h4>
                  <div className="trending-meta">
                    <Tag size={10} style={{ marginRight: '4px' }} /> Community
                  </div>
                </div>
              </div>
              <div className="trending-item">
                <div className="trending-num">03</div>
                <div className="trending-info">
                  <h4 className="trending-title">Perseid Meteor Shower Zenith Forecast</h4>
                  <div className="trending-meta">
                    <Tag size={10} style={{ marginRight: '4px' }} /> Skywatching
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="newsletter-widget">
            <div className="newsletter-icon">
              <Mail size={18} />
            </div>
            <h3>The Event Horizon</h3>
            <p>Get a curated weekly digest of the biggest astronomical discoveries sent directly to your inbox.</p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Subscribed to the Event Horizon!');
              }}
            >
              <input type="email" placeholder="Your email address" required style={{ color: 'var(--text-primary)' }} />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Magazine;
