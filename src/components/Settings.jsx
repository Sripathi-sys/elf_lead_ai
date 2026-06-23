import React, { useState } from 'react';
import { Save, RefreshCw, Key, Shield, User, FileText, Database } from 'lucide-react';

export default function Settings({ settings, onSaveSettings, onLoadDemoData, onClearData }) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="settings-view">
      <div className="header-container">
        <div className="header-title">
          <h1>System Settings</h1>
          <p>Change your business details, Gemini AI setup, and manage your saved business data.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Shield size={20} className="pulse" style={{ color: 'var(--accent-light)' }} />
              Gemini AI Connection
              {import.meta.env.VITE_GEMINI_API_KEY && (
                <span className="badge badge-score-a" style={{ fontSize: '0.65rem', padding: '2px 8px', textTransform: 'none', fontWeight: 'bold' }}>
                  ✓ Loaded from Vercel
                </span>
              )}
            </h2>
            <div className="form-group">
              <label className="form-label" htmlFor="apiKey">
                Your API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  placeholder={import.meta.env.VITE_GEMINI_API_KEY ? "••••••••••••••••••••" : "Paste your key here (AIzaSy...)"}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                />
                <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {import.meta.env.VITE_GEMINI_API_KEY ? (
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                    ✓ Pre-configured via Vercel. You can type another key here to override it.
                  </span>
                ) : (
                  "This key is saved in your browser. If you do not have a key, a built-in simulator will respond automatically."
                )}
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} style={{ color: 'var(--accent-light)' }} />
              Your Profile
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="senderName">Your Name</label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="e.g. Sanjay Kumar"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="senderTitle">Your Job Title</label>
                <input
                  type="text"
                  id="senderTitle"
                  name="senderTitle"
                  value={formData.senderTitle}
                  onChange={handleChange}
                  placeholder="e.g. Marketing Manager"
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="companyName">Your Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Chennai Digital Media"
                className="form-control"
                required
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} style={{ color: 'var(--accent-light)' }} />
              What You Sell
            </h2>
            <div className="form-group">
              <label className="form-label" htmlFor="companyDescription">Explain Your Business</label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleChange}
                placeholder="Describe what services you provide to your clients..."
                className="form-control"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="valueProposition">How You Help Clients (Value Prop)</label>
              <textarea
                id="valueProposition"
                name="valueProposition"
                value={formData.valueProposition}
                onChange={handleChange}
                placeholder="Explain the results you get for your clients (e.g. getting phone calls, increasing sales)..."
                className="form-control"
                rows={3}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Save Settings
            </button>
            {saveSuccess && (
              <span style={{ fontSize: '0.88rem', color: 'var(--success)', fontWeight: '600' }}>
                Settings saved successfully!
              </span>
            )}
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={20} style={{ color: 'var(--accent-light)' }} />
              Leads Data Management
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
              Load preset Chennai business listings to populate the table, or empty all records.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={onLoadDemoData} type="button" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <RefreshCw size={16} />
                Load Demo Businesses
              </button>
              <button onClick={onClearData} type="button" className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
                Clear All Leads
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Quick Start Guide</h3>
            <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Generate your key at <b>aistudio.google.com</b> and add it to Vercel (or input it above).</li>
              <li>Fill out your Profile and What You Sell.</li>
              <li>Go to the <b>Research Desk</b> page.</li>
              <li>Type in any Company Name or Instagram Username (e.g. <code>HB Construction Chennai</code>) and click search.</li>
              <li>Wait 1 second for the AI to collect details and add them directly to your Excel sheet table.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
