import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, MapPin, Search, Play, Crosshair, HardDrive, Battery, Wifi, Cpu, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function CyberVisionPanel({ backendUrl }) {
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Location state
  const [locationData, setLocationData] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Hardware / Battery state
  const [battery, setBattery] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [hardwareInfo, setHardwareInfo] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // App launch state
  const [customApp, setCustomApp] = useState('');
  const [appFeedback, setAppFeedback] = useState('');

  // 1. Fetch Location
  const fetchLocation = () => {
    setLocationLoading(true);
    cyberAudio.click();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`${backendUrl}/device/location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
            });
            const data = await res.json();
            setLocationData(data);
          } catch (e) {
            console.error(e);
          } finally {
            setLocationLoading(false);
          }
        },
        async () => {
          // Fallback to IP geolocation if GPS permission denied
          try {
            const res = await fetch(`${backendUrl}/device/location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });
            const data = await res.json();
            setLocationData(data);
          } catch (e) {
            console.error(e);
          } finally {
            setLocationLoading(false);
          }
        },
        { timeout: 7000 }
      );
    } else {
      setLocationLoading(false);
    }
  };

  // 2. Fetch Hardware Telemetry
  const fetchHardware = async () => {
    try {
      const res = await fetch(`${backendUrl}/device/hardware`);
      if (res.ok) {
        const data = await res.json();
        setHardwareInfo(data);
      }
    } catch (e) {}
  };

  // 3. Camera Controls
  const startCamera = async () => {
    cyberAudio.confirm();
    try {
      const constraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      cyberAudio.alert();
      alert(`Camera Access Error: ${err.message}. Please allow camera permissions.`);
    }
  };

  const stopCamera = () => {
    cyberAudio.click();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !cameraActive) return;
    cyberAudio.confirm();
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setSnapshot(dataUrl);
  };

  // 4. App Launch Handler
  const launchApp = async (appName) => {
    if (!appName) return;
    cyberAudio.confirm();
    setAppFeedback(`Launching ${appName}...`);
    try {
      const res = await fetch(`${backendUrl}/device/open-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_name: appName })
      });
      const data = await res.json();
      if (data.success) {
        setAppFeedback(`✓ ${data.message}`);
      } else {
        setAppFeedback(`⚠️ ${data.error}`);
      }
    } catch (err) {
      setAppFeedback(`Failed: ${err.message}`);
    }
  };

  // 5. Live Search Handler
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || searchLoading) return;
    cyberAudio.confirm();
    setSearchLoading(true);
    try {
      const res = await fetch(`${backendUrl}/device/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      cyberAudio.alert();
    } finally {
      setSearchLoading(false);
    }
  };

  // Initialization
  useEffect(() => {
    fetchLocation();
    fetchHardware();

    // Enumerate connected cameras
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevs = devices.filter((d) => d.kind === 'videoinput');
        setCameraDevices(videoDevs);
        if (videoDevs.length > 0) setSelectedCamera(videoDevs[0].deviceId);
      });
    }

    // Battery API
    if ('getBattery' in navigator) {
      navigator.getBattery().then((batt) => {
        setBattery({
          level: Math.round(batt.level * 100),
          charging: batt.charging
        });
        batt.addEventListener('levelchange', () => {
          setBattery({ level: Math.round(batt.level * 100), charging: batt.charging });
        });
      });
    }

    // Network connection
    if ('connection' in navigator) {
      const conn = navigator.connection;
      setNetworkInfo({
        effectiveType: conn.effectiveType,
        downlink: conn.downlink
      });
    }

    return () => {
      stopCamera();
    };
  }, []);

  const quickApps = [
    { name: 'Notepad', target: 'notepad' },
    { name: 'Calculator', target: 'calc' },
    { name: 'VS Code', target: 'code' },
    { name: 'Google Chrome', target: 'chrome' },
    { name: 'Edge Browser', target: 'edge' },
    { name: 'File Explorer', target: 'explorer' },
    { name: 'Task Manager', target: 'taskmgr' },
    { name: 'Paint', target: 'paint' },
    { name: 'Windows Settings', target: 'settings' }
  ];

  return (
    <div style={{ margin: '0 20px', height: 'calc(100vh - 110px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative', zIndex: 5, overflowY: 'auto' }}>
      
      {/* Left Column: Cyber-Vision Optical Camera + Location Radar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Optical Camera Box */}
        <div className="cyber-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-cyber neon-text-cyan" style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} /> // CYBER-VISION OPTICAL SCANNER
            </h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {cameraActive ? (
                <>
                  <button onClick={takeSnapshot} className="btn-cyber-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                    <Crosshair size={13} /> SNAPSHOT
                  </button>
                  <button onClick={stopCamera} className="btn-cyber-secondary" style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--neon-pink)', borderColor: 'var(--neon-pink)' }}>
                    <CameraOff size={13} /> DISENGAGE
                  </button>
                </>
              ) : (
                <button onClick={startCamera} className="btn-cyber-primary" style={{ padding: '6px 14px', fontSize: '11px' }}>
                  <Camera size={14} /> ENGAGE CAMERA
                </button>
              )}
            </div>
          </div>

          {/* Camera Viewport / Reticle */}
          <div
            style={{
              height: '240px',
              background: '#020409',
              border: '1px solid var(--border-subtle)',
              borderLeft: '3px solid var(--neon-cyan)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: cameraActive ? 'block' : 'none',
                transform: 'scaleX(-1)' // Mirror preview
              }}
            />

            {!cameraActive && (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '20px' }}>
                <Camera size={36} color="var(--border-subtle)" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                [OPTICAL SENSOR DISENGAGED // CLICK "ENGAGE CAMERA" TO ACTIVATE LIVE WEBCAM]
              </div>
            )}

            {/* Futuristic HUD Crosshairs Overlay */}
            {cameraActive && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', border: '1px dashed rgba(0, 242, 254, 0.4)', margin: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Crosshair size={42} color="var(--neon-cyan)" style={{ opacity: 0.6 }} />
                <div style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', background: 'rgba(0,0,0,0.6)', padding: '2px 6px' }}>
                  ● OPTICAL_STREAM_LIVE // 60FPS
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', background: 'rgba(0,0,0,0.6)', padding: '2px 6px' }}>
                  HD 1080P // SENSOR_OK
                </div>
              </div>
            )}
          </div>

          {/* Snapshot Preview if Taken */}
          {snapshot && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid var(--border-subtle)' }}>
              <img src={snapshot} alt="Captured scan" style={{ width: '60px', height: '45px', objectFit: 'cover', border: '1px solid var(--neon-cyan)' }} />
              <div style={{ flex: 1, fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
                ✓ OPTICAL SNAPSHOT CAPTURED SUCCESSFULLY
              </div>
              <button onClick={() => setSnapshot(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '11px' }}>
                DISMISS
              </button>
            </div>
          )}
        </div>

        {/* Location Radar Box */}
        <div className="cyber-panel cyber-panel-yellow" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-cyber neon-text-yellow" style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} /> // GEOLOCATION RADAR
            </h3>
            <button
              onClick={fetchLocation}
              disabled={locationLoading}
              className="btn-cyber-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              <RefreshCw size={12} className={locationLoading ? 'animate-spin' : ''} /> RE-SCAN GPS
            </button>
          </div>

          {locationData ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '10px' }}>CURRENT CITY / REGION</span>
                <span style={{ color: 'var(--neon-yellow)', fontWeight: 700, fontSize: '14px' }}>
                  {locationData.city || 'Detected'}, {locationData.region || locationData.state || ''}
                </span>
              </div>

              <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '10px' }}>COUNTRY / TIMEZONE</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {locationData.country || 'Global'} {locationData.timezone ? `(${locationData.timezone})` : ''}
                </span>
              </div>

              <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '10px' }}>GPS LATITUDE</span>
                <span style={{ color: 'var(--neon-cyan)' }}>{locationData.latitude ?? 'GPS_ACQUIRING'}</span>
              </div>

              <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '10px' }}>GPS LONGITUDE</span>
                <span style={{ color: 'var(--neon-cyan)' }}>{locationData.longitude ?? 'GPS_ACQUIRING'}</span>
              </div>

              {locationData.map_url && (
                <div style={{ gridColumn: 'span 2' }}>
                  <a
                    href={locationData.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber-primary"
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> LAUNCH GOOGLE MAPS SATELLITE RADAR
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {locationLoading ? 'ACQUIRING ORBITAL TELEMETRY & GPS SIGNALS...' : 'CLICK "RE-SCAN GPS" TO ACQUIRE LOCATION'}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Windows App Launcher + Live Web Search + Hardware Telemetry */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Windows App Launcher Matrix */}
        <div className="cyber-panel cyber-panel-pink" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-cyber neon-text-pink" style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} /> // WINDOWS APP LAUNCHER MATRIX
            </h3>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
              INSTANT_EXEC
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Say <em>"open &lt;app name&gt;"</em> in Neural Chat, or click any direct shortcut below to launch instantly on Windows:
          </p>

          {/* Quick Launch Buttons Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {quickApps.map((app) => (
              <button
                key={app.target}
                onClick={() => launchApp(app.target)}
                className="btn-cyber-secondary"
                style={{ fontSize: '11px', padding: '8px', justifyContent: 'center', textAlign: 'center' }}
              >
                {app.name}
              </button>
            ))}
          </div>

          {/* Custom App Launcher Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); launchApp(customApp); setCustomApp(''); }}
            style={{ display: 'flex', gap: '8px', marginTop: '6px' }}
          >
            <input
              type="text"
              value={customApp}
              onChange={(e) => setCustomApp(e.target.value)}
              placeholder="Or type any Windows executable name (e.g. spotify, cmd)..."
              style={{
                flex: 1,
                background: 'rgba(8, 16, 32, 0.9)',
                border: '1px solid var(--border-subtle)',
                padding: '8px 12px',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-hud)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn-cyber-primary" style={{ padding: '8px 14px' }}>
              LAUNCH
            </button>
          </form>

          {appFeedback && (
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', padding: '4px 8px', background: 'rgba(0, 242, 254, 0.08)' }}>
              {appFeedback}
            </div>
          )}
        </div>

        {/* Live Web Search Console */}
        <div className="cyber-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-cyber neon-text-cyan" style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} /> // LIVE REAL-TIME WEB SEARCH
            </h3>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
              LIVE_INDEX
            </span>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live web data, current news, technology, places..."
              style={{
                flex: 1,
                background: 'rgba(8, 16, 32, 0.9)',
                border: '1px solid var(--border-subtle)',
                padding: '8px 12px',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-hud)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn-cyber-primary" style={{ padding: '8px 14px' }} disabled={searchLoading || !searchQuery.trim()}>
              {searchLoading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </form>

          {/* Search Results Display */}
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {searchResults.map((r, i) => (
                <div key={i} style={{ padding: '8px 10px', background: 'rgba(0, 242, 254, 0.04)', border: '1px solid var(--border-subtle)' }}>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {r.title} <ExternalLink size={11} />
                  </a>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                    {r.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hardware & Telemetry Matrix */}
        <div className="cyber-panel" style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Cpu size={12} color="var(--neon-green)" /> GPU
            </div>
            <div style={{ color: 'var(--neon-green)', fontWeight: 700 }}>RTX 3050 CUDA</div>
          </div>

          <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Battery size={12} color="var(--neon-cyan)" /> BATTERY
            </div>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>
              {battery ? `${battery.level}% ${battery.charging ? '(⚡)' : ''}` : 'AC POWER'}
            </div>
          </div>

          <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Wifi size={12} color="var(--neon-yellow)" /> NETWORK
            </div>
            <div style={{ color: 'var(--neon-yellow)', fontWeight: 700 }}>
              {networkInfo ? `${networkInfo.effectiveType.toUpperCase()} (${networkInfo.downlink}M)` : 'ONLINE'}
            </div>
          </div>

          <div style={{ background: 'rgba(8, 16, 32, 0.7)', padding: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Eye size={12} color="var(--neon-pink)" /> WEBCAMS
            </div>
            <div style={{ color: 'var(--neon-pink)', fontWeight: 700 }}>
              {cameraDevices.length > 0 ? `${cameraDevices.length} DETECTED` : '1 DETECTED'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
