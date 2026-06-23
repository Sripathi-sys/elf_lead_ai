import React, { useState } from 'react';
import { Sparkles, MapPin, Search, Plus, Check, Database, AlertCircle } from 'lucide-react';
import { prospectLeads, scoreLead } from '../utils/gemini';

export default function Prospector({ settings, onAddLead, leads }) {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [icp, setIcp] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [scoringStatus, setScoringStatus] = useState({}); // tracking background AI scoring

  const handleProspect = async (e) => {
    e.preventDefault();
    if (!industry || !location) return;

    setLoading(true);
    setResults([]);
    setAddedIds(new Set());
    
    try {
      const generated = await prospectLeads(settings.apiKey, industry, location, icp);
      // Give each lead a temporary ID for tracking
      const mapped = generated.map((lead, idx) => ({
        ...lead,
        tempId: 'temp_' + Date.now() + '_' + idx
      }));
      setResults(mapped);
    } catch (err) {
      alert("Failed to generate prospects: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (prospect) => {
    if (addedIds.has(prospect.tempId)) return;

    // Set status to scoring
    setScoringStatus(prev => ({ ...prev, [prospect.tempId]: 'scoring' }));

    const leadItem = {
      companyName: prospect.companyName,
      contactName: prospect.contactName,
      email: prospect.email,
      website: prospect.website || '',
      description: prospect.description,
      industry: prospect.industry,
      location: prospect.location,
      status: 'new',
      source: 'AI Prospector',
      createdAt: new Date().toISOString()
    };

    try {
      // Score lead in background
      const aiResponse = await scoreLead(settings.apiKey, leadItem, settings);
      leadItem.aiScore = aiResponse;
      setScoringStatus(prev => ({ ...prev, [prospect.tempId]: 'success' }));
    } catch (err) {
      console.warn("AI score enrichment failed during prospect importing.", err);
      setScoringStatus(prev => ({ ...prev, [prospect.tempId]: 'failed' }));
    }

    onAddLead(leadItem);
    setAddedIds(prev => {
      const next = new Set(prev);
      next.add(prospect.tempId);
      return next;
    });
  };

  const handleAddAll = async () => {
    const unadded = results.filter(r => !addedIds.has(r.tempId));
    if (unadded.length === 0) return;

    // Process all sequentially or parallelly
    await Promise.all(unadded.map(prospect => handleAddLead(prospect)));
  };

  // Quick industry suggestion chips
  const suggestions = ['SaaS / Tech', 'Dental Clinics', 'Digital Agencies', 'E-commerce Brands', 'Real Estate Brokers'];

  return (
    <div className="prospector-view">
      <div className="header-container">
        <div className="header-title">
          <h1>AI Lead Prospector</h1>
          <p>Describe your target audience and location to generate real-time high-quality prospects using Gemini.</p>
        </div>
      </div>

      <div className="prospector-container">
        {/* Search Panel Card */}
        <form onSubmit={handleProspect} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} style={{ color: 'var(--accent-light)' }} />
            Target Parameters
          </h2>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Industry / Niche</label>
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Dental Clinics, SaaS Startups"
              className="form-control"
            />
            {/* Quick Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setIndustry(s)}
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--accent-light)';
                    e.target.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Location</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, London, Remote"
                className="form-control"
                style={{ paddingLeft: '44px' }}
              />
              <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ideal Customer Profile (ICP Notes)</label>
            <textarea
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              placeholder="e.g. Companies looking to modernize their web presence or streamline customer onboarding."
              className="form-control"
              rows={3}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '8px' }}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Scouting Prospects...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Leads with AI
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {results.length > 0 && (
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Found {results.length} Target Opportunities
              </span>
              <button 
                onClick={handleAddAll} 
                className="btn btn-secondary" 
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                disabled={results.every(r => addedIds.has(r.tempId))}
              >
                <Database size={14} />
                Import All to CRM
              </button>
            </div>
          )}

          {loading ? (
            <div className="glass-card empty-state" style={{ height: '300px' }}>
              <Sparkles size={40} className="pulse" style={{ color: 'var(--accent-light)' }} />
              <h3>Consulting Gemini AI</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', marginTop: '10px' }}>
                Analyzing regional directories, identifying market pain points, and constructing prospect records...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="glass-card empty-state" style={{ height: '300px' }}>
              <AlertCircle size={40} />
              <h3>No Prospects Loaded</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Configure target parameters and click search to view AI generated prospects.
              </p>
            </div>
          ) : (
            <div className="prospect-results">
              {results.map((prospect) => {
                const isAdded = addedIds.has(prospect.tempId);
                const scoreStatus = scoringStatus[prospect.tempId];

                return (
                  <div key={prospect.tempId} className="glass-card prospect-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{prospect.companyName}</h3>
                        {prospect.website && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {prospect.website}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                        {prospect.description}
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span><b>Contact:</b> {prospect.contactName} ({prospect.email})</span>
                        <span><b>Location:</b> {prospect.location}</span>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {isAdded ? (
                        <button 
                          className="btn btn-secondary" 
                          disabled 
                          style={{ borderColor: 'var(--success)', color: 'var(--success)', minWidth: '130px', display: 'flex', gap: '6px', justifyContent: 'center' }}
                        >
                          <Check size={16} />
                          {scoreStatus === 'scoring' ? 'Scoring...' : 'Added to CRM'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddLead(prospect)}
                          disabled={scoreStatus === 'scoring'}
                          className="btn btn-primary"
                          style={{ minWidth: '130px', display: 'flex', gap: '6px', justifyContent: 'center' }}
                        >
                          {scoreStatus === 'scoring' ? (
                            <>
                              <div className="spinner" style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                              Scoring...
                            </>
                          ) : (
                            <>
                              <Plus size={16} />
                              Add to CRM
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
