import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Copy, Check, MessageSquare, Mail, AlertCircle, Edit2, CheckSquare } from 'lucide-react';
import { generateOutreach } from '../utils/gemini';

export default function Outreach({ 
  leads, selectedLead, onSelectLead, settings, onUpdateLeadStage 
}) {
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [type, setType] = useState('Email');
  
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Re-generate outreach when lead changes or settings change
  const handleGenerate = async () => {
    if (!selectedLead) return;
    setLoading(true);
    setCopied(false);
    setIsSent(false);
    
    try {
      const generated = await generateOutreach(settings.apiKey, selectedLead, settings, {
        tone,
        length,
        type
      });
      setDraft(generated);
    } catch (err) {
      alert("Error generating outreach: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLead) {
      handleGenerate();
    } else {
      setDraft('');
    }
  }, [selectedLead, tone, length, type]);

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulated = () => {
    if (!selectedLead) return;
    setIsSent(true);
    // Mark status as contacted/in-progress
    onUpdateLeadStage(selectedLead.id, 'contacted');
    setTimeout(() => setIsSent(false), 3000);
  };

  // Sort leads for list: Qualified fits first, then alphabetical
  const sortedLeads = [...leads].sort((a, b) => {
    const aScore = a.aiScore?.score || 0;
    const bScore = b.aiScore?.score || 0;
    return bScore - aScore;
  });

  return (
    <div className="outreach-view">
      <div className="header-container">
        <div className="header-title">
          <h1>AI Outreach Writer</h1>
          <p>Generate highly personalized cold outreach messages utilizing lead intelligence and Gemini.</p>
        </div>
      </div>

      <div className="outreach-container">
        {/* Left Column: Leads Selector */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '620px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Select Prospect</h2>
          <div className="lead-selector-list" style={{ flexGrow: 1 }}>
            {sortedLeads.length === 0 ? (
              <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
                <AlertCircle size={28} />
                <p>No prospects available in database.</p>
              </div>
            ) : (
              sortedLeads.map((lead) => {
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <div
                    key={lead.id}
                    className={`lead-selector-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectLead(lead)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.companyName}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {lead.contactName}
                      </span>
                    </div>

                    <div>
                      {lead.aiScore ? (
                        <span className={`badge badge-score-${lead.aiScore.tier.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          Tier {lead.aiScore.tier}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unscored</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Editor & Generation */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '620px' }}>
          {selectedLead ? (
            <>
              {/* Profile Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>{selectedLead.companyName}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Targeting: <b>{selectedLead.contactName}</b> ({selectedLead.email})
                  </span>
                </div>
                <button onClick={handleGenerate} disabled={loading} className="btn btn-secondary btn-icon" title="Regenerate Draft">
                  <Sparkles size={14} style={{ color: 'var(--accent-light)' }} />
                </button>
              </div>

              {/* Layout Config */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Tone</label>
                  <select 
                    value={tone} 
                    onChange={(e) => setTone(e.target.value)} 
                    className="glass-input" 
                    style={{ padding: '8px 12px', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Bold">Bold & Direct</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Length</label>
                  <select 
                    value={length} 
                    onChange={(e) => setLength(e.target.value)} 
                    className="glass-input" 
                    style={{ padding: '8px 12px', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    <option value="Short">Short (&lt;100 words)</option>
                    <option value="Medium">Medium</option>
                    <option value="Long">Long</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Platform</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    className="glass-input" 
                    style={{ padding: '8px 12px', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    <option value="Email">Cold Email</option>
                    <option value="LinkedIn">LinkedIn Invite</option>
                  </select>
                </div>
              </div>

              {/* Output Content */}
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>AI Generated Copy</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    Click text box to edit
                  </span>
                </label>

                {loading ? (
                  <div className="glass-card empty-state" style={{ flexGrow: 1, background: 'rgba(0,0,0,0.15)' }}>
                    <Sparkles size={32} className="pulse" style={{ color: 'var(--accent-light)' }} />
                    <p style={{ marginTop: '12px' }}>Drafting customized outreach using Gemini AI...</p>
                  </div>
                ) : (
                  <textarea
                    className="email-output-box"
                    style={{ flexGrow: 1, width: '100%', resize: 'none' }}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={handleCopy} disabled={!draft} className="btn btn-secondary" style={{ flexGrow: 1 }}>
                  {copied ? (
                    <>
                      <Check size={16} style={{ color: 'var(--success)' }} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy to Clipboard
                    </>
                  )}
                </button>

                <button 
                  onClick={handleSendSimulated} 
                  disabled={!draft || isSent} 
                  className="btn btn-primary" 
                  style={{ flexGrow: 1 }}
                >
                  {isSent ? (
                    <>
                      <CheckSquare size={16} />
                      Sent Confirmation!
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Mark as Contacted
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
              <Mail size={48} style={{ color: 'var(--text-muted)' }} />
              <h2>No Recipient Selected</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', margin: '8px auto' }}>
                Choose a lead from the database checklist on the left side to write outreach copy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
