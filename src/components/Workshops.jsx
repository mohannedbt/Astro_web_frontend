import React, { useState } from 'react';
import {
  Search,
  Layers,
  VideoOff,
  ChevronRight,
  User,
  Calendar,
  Clock,
  X,
  BarChart2,
  CheckSquare,
  AlignLeft,
  List,
  FileText,
  MonitorPlay,
  Download,
  MonitorOff,
} from 'lucide-react';

import { fetchWorkshops } from '../services/api';

const Workshops = () => {
  const [workshopsDatabase, setWorkshopsDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      const data = await fetchWorkshops();
      setWorkshopsDatabase(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredWorkshops = workshopsDatabase.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase().trim()) ||
      item.instructor.toLowerCase().includes(searchText.toLowerCase().trim());
    const matchTopic = topicFilter === 'all' || item.topic === topicFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchTopic && matchStatus;
  });

  const handleJoin = (item) => {
    alert(`Success! Connecting to module: [${item.title}]`);
    setSelectedWorkshop(null);
  };

  return (
    <div className="page-content">
      <div className="page-title-area">
        <h1>Educational Workshops</h1>
        <p>Enhance your deep-sky processing, observational workflow, and technical sky tracking skills with experts.</p>
      </div>

      <section className="filter-panel">
        <div className="search-input-wrapper">
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search title, host, or topics..."
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
              <option value="astrophotography" style={{ background: 'var(--bg-surface)' }}>Astrophotography</option>
              <option value="astrophysics" style={{ background: 'var(--bg-surface)' }}>Astrophysics</option>
              <option value="hardware" style={{ background: 'var(--bg-surface)' }}>Telescope Hardware</option>
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
            <h3>No matching workshops discovered</h3>
            <p>Try modifying your search queries or select alternative classifications.</p>
          </div>
        ) : (
          filteredWorkshops.map((item) => {
            let actionBtn = (
              <button className="btn-join" onClick={() => setSelectedWorkshop(item)}>
                Join
              </button>
            );

            if (item.status === 'completed') {
              actionBtn = (
                <button className="btn-join" disabled>
                  <VideoOff size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Archived
                </button>
              );
            } else if (item.status === 'ongoing') {
              actionBtn = (
                <button
                  className="btn-join"
                  style={{ background: '#22c55e', color: '#000', borderColor: '#22c55e' }}
                  onClick={() => setSelectedWorkshop(item)}
                >
                  Enter Live
                </button>
              );
            }

            return (
              <div className={`ws-card ${item.status}`} key={item.id}>
                <div className="ws-card-banner"></div>
                <div className="ws-card-body">
                  <div className="ws-card-meta">
                    <span className="topic-tag">{item.topicLabel}</span>
                    <span className="status-badge">{item.statusLabel}</span>
                  </div>
                  <h3 className="ws-title">{item.title}</h3>
                  <p className="ws-summary">{item.summary}</p>
                  <div className="ws-details-row">
                    <span>
                      <User size={14} /> Host: {item.instructor}
                    </span>
                    <span>
                      <Calendar size={14} /> {item.date} • {item.time}
                    </span>
                    <span>
                      <Clock size={14} /> Duration: {item.duration}
                    </span>
                  </div>
                </div>
                <div className="ws-card-actions">
                  <button className="btn-more" onClick={() => setSelectedWorkshop(item)}>
                    See Details <ChevronRight size={14} />
                  </button>
                  {actionBtn}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedWorkshop && (
        <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setSelectedWorkshop(null)}>
          <div className="modal-container">
            <div className="modal-header-sec">
              <span className="topic-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>
                {selectedWorkshop.topicLabel}
              </span>
              <h2 style={{ fontSize: '26px', lineHeight: 1.3 }}>{selectedWorkshop.title}</h2>
              <div className="ws-details-row" style={{ border: 'none', paddingTop: '12px', flexDirection: 'row', gap: '24px' }}>
                <span>
                  <User size={16} /> {selectedWorkshop.instructor}
                </span>
                <span>
                  <Calendar size={16} /> {selectedWorkshop.date} @ {selectedWorkshop.time}
                </span>
                <span>
                  <Clock size={16} /> {selectedWorkshop.duration}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelectedWorkshop(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-sec">
              <div className="modal-grid-2col">
                <div className="info-block">
                  <div className="info-label">
                    <BarChart2 size={14} /> Difficulty Level
                  </div>
                  <div>
                    <span className={`level-badge ${selectedWorkshop.level.toLowerCase()}`}>
                      {selectedWorkshop.level} Level
                    </span>
                  </div>
                </div>
                <div className="info-block">
                  <div className="info-label">
                    <CheckSquare size={14} /> Prerequisites
                  </div>
                  <div className="prereq-list">
                    {selectedWorkshop.prerequisites.map((p, idx) => (
                      <span className="prereq-item" key={idx}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="info-block">
                <div className="info-label">
                  <AlignLeft size={14} /> Overview & Description
                </div>
                <p className="desc-text">{selectedWorkshop.fullDetail}</p>
              </div>

              <div className="info-block">
                <div className="info-label">
                  <List size={14} /> Workshop Agenda
                </div>
                <div className="agenda-list">
                  {selectedWorkshop.agenda.map((a, idx) => (
                    <div className="agenda-item" key={idx}>
                      {a}
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-block">
                <div className="info-label">
                  <FileText size={14} /> Presentation Materials
                </div>
                <div className="presentation-card">
                  {selectedWorkshop.presentationLink ? (
                    <>
                      <div className="pres-info">
                        <MonitorPlay size={16} style={{ marginRight: '8px' }} /> Standard Presentation Deck
                      </div>
                      <a
                        href={selectedWorkshop.presentationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pres-link"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        Download PDF <Download size={12} />
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="pres-info">
                        <MonitorOff size={16} style={{ color: 'var(--text-tertiary)', marginRight: '8px' }} /> No slides available
                      </div>
                      <span className="pres-unavailable">Live demonstration only</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-more" style={{ background: 'transparent', border: 'none' }} onClick={() => setSelectedWorkshop(null)}>
                Cancel
              </button>
              <button
                className="btn-join"
                style={{
                  margin: 0,
                  padding: '10px 24px',
                  borderRadius: '30px',
                  background: selectedWorkshop.status === 'completed' ? 'transparent' : selectedWorkshop.status === 'ongoing' ? 'var(--status-ongoing)' : 'var(--text-primary)',
                  borderColor: selectedWorkshop.status === 'completed' ? 'var(--border)' : selectedWorkshop.status === 'ongoing' ? 'var(--status-ongoing)' : 'var(--text-primary)',
                  color: selectedWorkshop.status === 'completed' ? 'var(--text-tertiary)' : selectedWorkshop.status === 'ongoing' ? '#000' : 'var(--bg-base)',
                }}
                disabled={selectedWorkshop.status === 'completed'}
                onClick={() => handleJoin(selectedWorkshop)}
              >
                {selectedWorkshop.status === 'completed'
                  ? 'Archived Recording Unavailable'
                  : selectedWorkshop.status === 'ongoing'
                  ? 'Connect Instantly to Stream'
                  : 'Reserve Seat / Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workshops;
