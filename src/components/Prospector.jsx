import React, { useState } from 'react';
import { Sparkles, Search, Check, Database, AlertCircle, Globe, Phone, ShieldCheck, Megaphone, Instagram, Facebook } from 'lucide-react';
import { researchCompany } from '../utils/gemini';

export default function Prospector({ settings, onAddLead }) {
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isAdded, setIsAdded] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setLoading(true);
    setResult(null);
    setIsAdded(false);
    
    try {
      const data = await researchCompany(settings.apiKey, queryInput);
      setResult(data);
    } catch (err) {
      alert("Failed to find details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToExcel = () => {
    if (!result || isAdded) return;

    const leadItem = {
      ...result,
      id: 'lead_researched_' + Date.now(),
      createdAt: new Date().toISOString()
    };

    onAddLead(leadItem);
    setIsAdded(true);
  };

  return (
    <div className="prospector-view">
      <div className="header-container">
        <div className="header-title">
          <h1>Company Research Desk</h1>
          <p>Search any company name or Instagram username to automatically collect their details for digital marketing.</p>
        </div>
      </div>

      <div className="prospector-container">
        {/* Input Panel */}
        <form onSubmit={handleSearch} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} style={{ color: 'var(--accent)' }} />
            Search Business
          </h2>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Company Name or Instagram Handle</label>
            <input
              type="text"
              required
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. HB Construction Chennai or @deepambridal"
              className="form-control"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Researching...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Research Business
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div className="glass-card empty-state" style={{ height: '340px' }}>
              <Sparkles size={40} className="pulse" style={{ color: 'var(--accent-light)' }} />
              <h3>Looking Up Details</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', marginTop: '10px' }}>
                Analyzing websites, finding contact numbers, checking Meta Ads Library, and verifying Instagram followers...
              </p>
            </div>
          ) : !result ? (
            <div className="glass-card empty-state" style={{ height: '340px' }}>
              <Search size={40} />
              <h3>Enter a Business to Start</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Type a name or social profile handle on the left to collect information.
              </p>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{result.companyName}</h3>
                  <span className="badge badge-score-a" style={{ marginTop: '6px' }}>{result.businessType}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <button
                    onClick={handleSaveToExcel}
                    className={`btn ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                    style={isAdded ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}}
                    disabled={isAdded}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} />
                        Added to Excel
                      </>
                    ) : (
                      <>
                        <Database size={16} />
                        Add to Excel Table
                      </>
                    )}
                  </button>
                  {isAdded && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: '600', maxWidth: '240px', textAlign: 'right' }}>
                      ✓ Added! Find or export this under the <b>Leads Table</b> tab on the left.
                    </span>
                  )}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

              {/* Grid of collected parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Phone size={18} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Contact Numbers</h4>
                    <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>{result.contactNumber}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Globe size={18} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Website Status</h4>
                    <span className={`badge ${result.websiteStatus === 'Active website' ? 'badge-web-active' : result.websiteStatus === 'No website' ? 'badge-web-none' : 'badge-web-inactive'}`} style={{ margin: '4px 0 6px', fontSize: '0.7rem' }}>
                      {result.websiteStatus}
                    </span>
                    {result.websiteUrl && (
                      <p style={{ fontSize: '0.9rem' }}>
                        URL: <a href={`https://${result.websiteUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{result.websiteUrl}</a>
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Instagram size={18} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Instagram Information</h4>
                    <p style={{ fontSize: '0.9rem' }}>
                      Profile: <a href={`https://${result.instagramLink}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>@{result.instagramLink.split('/').pop()}</a>
                    </p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Followers: <b>{result.instagramFollowers}</b>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Facebook size={18} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Facebook Page</h4>
                    <p style={{ fontSize: '0.9rem' }}>
                      {result.facebookLink === 'no page' ? (
                        <span style={{ color: 'var(--text-secondary)' }}>no page</span>
                      ) : (
                        <a href={`https://${result.facebookLink}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>fb.com/{result.facebookLink.split('/').pop()}</a>
                      )}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', gridColumn: 'span 2' }}>
                  <Megaphone size={18} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Meta Ads Status (Meta Ads Library)</h4>
                    <span className={`badge ${result.metaAdsStatus === 'Active' ? 'badge-ads-active' : result.metaAdsStatus === 'No page no ads' ? 'badge-web-none' : 'badge-ads-inactive'}`} style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                      {result.metaAdsStatus}
                    </span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Ads analyzed using Meta Ads Registry indexes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
