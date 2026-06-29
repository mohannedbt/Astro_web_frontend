import React, { useState, useEffect } from 'react';
import { Crosshair, ArrowUpDown, ArrowLeftRight, Satellite, Layers, Eye, Share2, Type, Moon, Grid, Loader, Check } from 'lucide-react';

const SkyMap = () => {
  const [lat, setLat] = useState('36.80');
  const [lon, setLon] = useState('10.18');
  const [constellations, setConstellations] = useState(true);
  const [labels, setLabels] = useState(false);
  const [planets, setPlanets] = useState(true);
  const [grid, setGrid] = useState(false);

  const [locatingState, setLocatingState] = useState('idle'); // 'idle' | 'locating' | 'success'

  const buildIframeUrl = () => {
    const baseUrl = 'https://virtualsky.lco.global/embed/index.html';
    const params = new URLSearchParams({
      longitude: parseFloat(lon).toFixed(2),
      latitude: parseFloat(lat).toFixed(2),
      projection: 'polar',
      constellations: constellations.toString(),
      constellationlabels: labels.toString(),
      planets: planets.toString(),
      gridlines_az: grid.toString(),
      meteorshowers: 'true',
      live: 'true',
      keyboard: 'false',
      color: 'black',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleGeolocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingState('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(2));
        setLon(position.coords.longitude.toFixed(2));
        setLocatingState('success');
        setTimeout(() => setLocatingState('idle'), 2000);
      },
      (error) => {
        console.error(error);
        alert('Unable to retrieve location. Please check browser permissions.');
        setLocatingState('idle');
      }
    );
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-area">
          <h1>Interactive Zenith Map</h1>
          <p>Real-time celestial projections based on your coordinates. Drag to explore.</p>
        </div>
        <div className="status-indicator">
          <div className="status-dot"></div> Live Telemetry Active
        </div>
      </div>

      <div className="map-layout">
        <div className="map-container">
          <iframe
            id="virtual-sky-frame"
            title="Virtual Sky Map"
            src={buildIframeUrl()}
          ></iframe>

          <div className="map-overlay-ui">
            <div className="map-coord-display">
              LAT: <span id="disp-lat">{parseFloat(lat).toFixed(2)}</span> ° &nbsp;|&nbsp; LON:{' '}
              <span id="disp-lon">{parseFloat(lon).toFixed(2)}</span> °
            </div>
          </div>
        </div>

        <div className="control-deck">
          <div className="panel">
            <h3 className="panel-title">
              <Crosshair size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Positioning
            </h3>
            <div className="loc-group">
              <label>Latitude (Decimal)</label>
              <div className="input-wrap">
                <ArrowUpDown size={16} />
                <input
                  type="number"
                  value={lat}
                  step="0.01"
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
            </div>
            <div className="loc-group">
              <label>Longitude (Decimal)</label>
              <div className="input-wrap">
                <ArrowLeftRight size={16} />
                <input
                  type="number"
                  value={lon}
                  step="0.01"
                  onChange={(e) => setLon(e.target.value)}
                />
              </div>
            </div>
            <button className="btn-gps" onClick={handleGeolocation} disabled={locatingState === 'locating'}>
              {locatingState === 'idle' && (
                <>
                  <Satellite size={16} /> Auto-Detect Location
                </>
              )}
              {locatingState === 'locating' && (
                <>
                  <Loader size={16} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} /> Locating...
                </>
              )}
              {locatingState === 'success' && (
                <>
                  <Check size={16} /> Synced
                </>
              )}
            </button>
          </div>

          <div className="panel">
            <h3 className="panel-title">
              <Layers size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Map Layers
            </h3>
            <div className="toggle-list">
              <div className="toggle-item">
                <span className="toggle-label">
                  <Share2 size={16} /> Constellations
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={constellations}
                    onChange={(e) => setConstellations(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-item">
                <span className="toggle-label">
                  <Type size={16} /> Star Names
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={labels}
                    onChange={(e) => setLabels(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-item">
                <span className="toggle-label">
                  <Moon size={16} /> Planets & Moon
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={planets}
                    onChange={(e) => setPlanets(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-item">
                <span className="toggle-label">
                  <Grid size={16} /> Azimuth Grid
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={grid}
                    onChange={(e) => setGrid(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">
              <Eye size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Notably Visible Now
            </h3>
            <div className="visible-list">
              <div className="obj-item">
                <span className="obj-name">
                  <span className="dot" style={{ background: '#eab308' }}></span> Jupiter
                </span>
                <span className="obj-mag">Mag -2.4</span>
              </div>
              <div className="obj-item">
                <span className="obj-name">
                  <span className="dot" style={{ background: '#a8a29e' }}></span> Moon
                </span>
                <span className="obj-mag">Mag -12.0</span>
              </div>
              <div className="obj-item">
                <span className="obj-name">
                  <span className="dot" style={{ background: '#ef4444' }}></span> Mars
                </span>
                <span className="obj-mag">Mag 0.8</span>
              </div>
              <div className="obj-item">
                <span className="obj-name">
                  <span className="dot" style={{ background: '#3b82f6' }}></span> Sirius
                </span>
                <span className="obj-mag">Mag -1.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkyMap;
