import React, { useEffect, useState } from 'react';
import {
  Search,
  Layers,
  User,
  Calendar,
  BarChart2,
  FileText,
  Download,
} from 'lucide-react';

import { fetchWorkshops } from '../services/api';

const Workshops = () => {
  const [workshopsDatabase, setWorkshopsDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const data = await fetchWorkshops();
        if (active) setWorkshopsDatabase(data);
      } catch (error) {
        console.error('Unable to load workshops:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, []);

  const topics = [...new Set(workshopsDatabase.map((item) => item.topic).filter(Boolean))];
  const filteredWorkshops = workshopsDatabase.filter((item) => {
    const query = searchText.toLowerCase().trim();
    const matchSearch = [item.title, item.instructor, item.summary].some((value) => value?.toLowerCase().includes(query));
    const matchTopic = topicFilter === 'all' || item.topic === topicFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchTopic && matchStatus;
  });

  return (
    <div className="page-content">
      <div className="page-title-area">
        <h1>Workshops</h1>
        <p>Browse planned sessions, meet their instructors, and open the presentation materials shared by the club.</p>
      </div>

      <section className="filter-panel">
        <div className="search-input-wrapper">
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search subjects, instructors, or descriptions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="filter-controls-right">
          <div className="custom-select-wrapper">
            <Layers size={14} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              style={{ background: 'transparent', color: 'inherit', border: 'none', cursor: 'pointer' }}
            >
              <option value="all" style={{ background: 'var(--bg-surface)' }}>All Topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic} style={{ background: 'var(--bg-surface)' }}>{topic}</option>
              ))}
            </select>
          </div>

          <div className="status-tabs">
            {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
              <div
                key={status}
                className={`status-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="workshops-grid">
        {loading ? (
          <div className="no-results" style={{ gridColumn: '1 / -1' }}>
            <h3>Loading Workshops...</h3>
          </div>
        ) : filteredWorkshops.length === 0 ? (
              <div className="no-results" style={{ gridColumn: '1 / -1' }}>
            <Search size={40} style={{ color: 'var(--text-tertiary)' }} />
            <h3>No workshops match these filters</h3>
            <p>Try another search or status.</p>
          </div>
        ) : (
          filteredWorkshops.map((item, index) => (
              <article className={`ws-card ${item.status}`} key={item.id}>
                <div className="ws-card-banner">
                  {item.image && !failedImages[item.id] ? (
                    <img
                      src={item.image}
                      alt={`${item.title} workshop`}
                      loading={index < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => setFailedImages((current) => ({ ...current, [item.id]: true }))}
                    />
                  ) : (
                    <div className="ws-image-fallback">
                      <span>ACI WORKSHOP</span>
                      <strong>{failedImages[item.id] ? 'Image could not be loaded' : 'Workshop cover'}</strong>
                      <small>{failedImages[item.id] ? 'Check that the URL links directly to an image.' : 'Add an image URL in the admin editor.'}</small>
                    </div>
                  )}
                </div>
                <div className="ws-card-body">
                  <div className="ws-card-meta">
                    <span className="topic-tag">{item.topicLabel}</span>
                    <span className="status-badge">{item.statusLabel}</span>
                  </div>
                  <h3 className="ws-title">{item.title}</h3>
                  <p className="ws-summary">{item.summary}</p>
                  <div className="ws-details-row">
                    <span>
                      <User size={14} /> Instructor: {item.instructor}
                    </span>
                    <span>
                      <Calendar size={14} /> {item.date || 'Date to be announced'}
                    </span>
                    <span>
                      <BarChart2 size={14} /> {item.level} level
                    </span>
                  </div>
                </div>
                {item.presentationLink && (
                  <div className="ws-card-actions">
                    <a className="ws-presentation-link" href={item.presentationLink} target="_blank" rel="noopener noreferrer">
                      <FileText size={15} /> View presentation <Download size={14} />
                    </a>
                  </div>
                )}
              </article>
            ))
        )}
      </div>
    </div>
  );
};

export default Workshops;
