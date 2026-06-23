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
          <p>Configure your business profile, Gemini API access, and database settings.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Shield size={20} className="pulse" style={{ color: 'var(--accent-light)' }} />
              API Key Setup
              {import.meta.env.VITE_GEMINI_API_KEY && (
                <span className="badge badge-score-a" style={{ fontSize: '0.65rem', padding: '2px 8px', textTransform: 'none', fontWeight: 'bold' }}>
                  ✓ Loaded from Vercel
                </span>
              )}
            </h2>
            <div className="form-group">
              <label className="form-label" htmlFor="apiKey">
                Gemini API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  placeholder={import.meta.env.VITE_GEMINI_API_KEY ? "••••••••••••••••••••" : "AIzaSy..."}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                />
                <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {import.meta.env.VITE_GEMINI_API_KEY ? (
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                    ✓ Pre-configured via Vercel environment variables. You can enter a different key here to override it.
                  </span>
                ) : (
                  "Your API key is saved locally in your browser's localStorage. If left blank, a simulated local AI model will respond."
                )}
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} style={{ color: 'var(--accent-light)' }} />
              Sender Profile
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
                  placeholder="e.g. Alex Rivera"
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
                  placeholder="e.g. Founder & CEO"
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
                placeholder="e.g. GrowthSpace"
                className="form-control"
                required
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} style={{ color: 'var(--accent-light)' }} />
              Product & Offering
            </h2>
            <div className="form-group">
              <label className="form-label" htmlFor="companyDescription">What does your company do?</label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleChange}
                placeholder="e.g. We build custom B2B web applications, dashboards, and API tools for growing tech startups."
                className="form-control"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="valueProposition">Your Value Proposition (What you sell / solve)</label>
              <textarea
                id="valueProposition"
                name="valueProposition"
                value={formData.valueProposition}
                onChange={handleChange}
                placeholder="e.g. Helping startups launch features 4x faster with modern React code and scalable serverless backends."
                className="form-control"
                rows={3}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Save Configuration
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
              Database Utilities
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
              Manage your local lead database state. You can load simulated demo data to explore features, or reset the app database.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={onLoadDemoData} type="button" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <RefreshCw size={16} />
                Load Mock Pipeline Data
              </button>
              <button onClick={onClearData} type="button" className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
                Delete All Local Data
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Quick Start Guide</h3>
            <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Enter your Gemini API key in the Setup box (or leave blank to use the simulator).</li>
              <li>Complete the Sender Profile and Offering fields.</li>
              <li>Go to the <b>AI Prospector</b> tab to generate new leads for your location and niche.</li>
              <li>Open the <b>Database</b> to qualify leads and assign score tiers using AI.</li>
              <li>Use the <b>Kanban Pipeline</b> to manage lead stages and draft outreach templates.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
