import React, { useState } from 'react';
import { 
  Search, Plus, Download, Upload, Trash2, Eye, 
  ArrowUpDown, ExternalLink, X, Sparkles, Send, RefreshCw, AlertCircle
} from 'lucide-react';
import { scoreLead } from '../utils/gemini';

export default function LeadTable({ 
  leads, onAddLead, onDeleteLead, onUpdateLeadStage, 
  onUpdateLeadAI, settings, setView, setSelectedLeadForOutreach 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortField, setSortField] = useState('companyName');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  // Form states
  const [newLead, setNewLead] = useState({
    companyName: '',
    contactName: '',
    email: '',
    website: '',
    description: '',
    industry: '',
    location: '',
    status: 'new'
  });
  const [importText, setImportText] = useState('');

  // Handle lead submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setScoringLoading(true);
    
    // Create new lead item with initial status
    const leadItem = {
      ...newLead,
      id: 'lead_' + Date.now(),
      source: 'Manual Add',
      createdAt: new Date().toISOString()
    };

    try {
      // Proactively score the lead with AI
      const aiResponse = await scoreLead(settings.apiKey, leadItem, settings);
      leadItem.aiScore = aiResponse;
    } catch (err) {
      console.error("AI scoring failed during creation.", err);
    }

    onAddLead(leadItem);
    setScoringLoading(false);
    setIsAddModalOpen(false);
    setNewLead({
      companyName: '',
      contactName: '',
      email: '',
      website: '',
      description: '',
      industry: '',
      location: '',
      status: 'new'
    });
  };

  // Re-run AI scoring for selected lead
  const handleRescoreLead = async (lead) => {
    setScoringLoading(true);
    try {
      const aiResponse = await scoreLead(settings.apiKey, lead, settings);
      onUpdateLeadAI(lead.id, aiResponse);
      // Update drawer display
      setSelectedLead({ ...lead, aiScore: aiResponse });
    } catch (err) {
      alert("Error scoring lead: " + err.message);
    } finally {
      setScoringLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Company Name', 'Contact Name', 'Email', 'Website', 'Industry', 'Location', 'Stage', 'AI Score', 'AI Tier', 'AI Analysis', 'Source'];
    const rows = leads.map(l => [
      l.companyName,
      l.contactName,
      l.email,
      l.website,
      l.industry,
      l.location,
      l.status,
      l.aiScore?.score || '',
      l.aiScore?.tier || '',
      l.aiScore?.analysis?.replace(/"/g, '""') || '',
      l.source
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_ai_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import parser (Simple comma-delimited parser)
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    if (lines.length < 2) return;

    // Assume headers are: companyName,contactName,email,website,industry,location
    const parsedLeads = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple regex to parse CSV fields with quotes support
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      if (matches.length < 3) continue;

      const clean = (val) => val ? val.replace(/^"|"$/g, '').trim() : '';

      parsedLeads.push({
        id: 'lead_csv_' + Date.now() + '_' + i,
        companyName: clean(matches[0]),
        contactName: clean(matches[1]),
        email: clean(matches[2]),
        website: clean(matches[3]) || '',
        industry: clean(matches[4]) || 'Other',
        location: clean(matches[5]) || 'Remote',
        status: 'new',
        source: 'CSV Import',
        createdAt: new Date().toISOString()
      });
    }

    // Load and append
    for (const lead of parsedLeads) {
      // Score with fallback (instant local)
      try {
        const aiResponse = await scoreLead(settings.apiKey, lead, settings);
        lead.aiScore = aiResponse;
      } catch (e) {}
      onAddLead(lead);
    }

    setIsImportModalOpen(false);
    setImportText('');
  };

  // Sort and Filter Logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchString = `${lead.companyName} ${lead.contactName} ${lead.email} ${lead.industry} ${lead.location}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || lead.status === stageFilter;
    const matchesTier = tierFilter === 'all' || 
      (tierFilter === 'unscored' && !lead.aiScore) ||
      (lead.aiScore && lead.aiScore.tier === tierFilter);
    
    return matchesSearch && matchesStage && matchesTier;
  }).sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'score') {
      aVal = a.aiScore?.score || 0;
      bVal = b.aiScore?.score || 0;
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="database-view">
      {/* Header Panel */}
      <div className="header-container">
        <div className="header-title">
          <h1>Leads Database</h1>
          <p>Organize pipeline stages, view complete AI fit assessments, and import datasets.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary">
            <Upload size={16} />
            Import CSV
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search leads by company, contact, email or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input"
            style={{ paddingLeft: '44px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={stageFilter} 
            onChange={(e) => setStageFilter(e.target.value)}
            className="glass-input" 
            style={{ width: '160px', cursor: 'pointer' }}
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in-progress">In Progress</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>

          <select 
            value={tierFilter} 
            onChange={(e) => setTierFilter(e.target.value)}
            className="glass-input" 
            style={{ width: '160px', cursor: 'pointer' }}
          >
            <option value="all">All AI Tiers</option>
            <option value="A">Tier A (High Fit)</option>
            <option value="B">Tier B (Medium Fit)</option>
            <option value="C">Tier C (Low Fit)</option>
            <option value="D">Tier D (Poor Fit)</option>
            <option value="unscored">Unscored</option>
          </select>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} />
            <h3>No Leads Found</h3>
            <p>Try refining your search terms or filter selection.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('companyName')}>
                    Company <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('contactName')}>
                    Contact <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('industry')}>
                    Industry <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('location')}>
                    Location <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('score')}>
                    AI Fit Rating <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th>Pipeline Stage</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {lead.companyName}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{lead.contactName}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lead.email}</span>
                      </div>
                    </td>
                    <td>{lead.industry}</td>
                    <td>{lead.location}</td>
                    <td>
                      {lead.aiScore ? (
                        <span className={`badge badge-score-${lead.aiScore.tier.toLowerCase()}`}>
                          Tier {lead.aiScore.tier} ({lead.aiScore.score})
                        </span>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleRescoreLead(lead);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                        >
                          <Sparkles size={12} />
                          Assess
                        </button>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateLeadStage(lead.id, e.target.value)}
                        className="glass-input"
                        style={{ padding: '6px 12px', fontSize: '0.82rem', width: '130px', cursor: 'pointer' }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in-progress">In Progress</option>
                        <option value="qualified">Qualified</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="btn btn-secondary btn-icon"
                          title="View Assessment Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="btn btn-danger btn-icon"
                          title="Delete Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sliding Details Drawer */}
      <div className={`drawer ${selectedLead ? 'open' : ''}`}>
        {selectedLead && (
          <>
            <div className="drawer-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Lead Profile Profile</h2>
              <button 
                onClick={() => setSelectedLead(null)} 
                className="btn btn-secondary btn-icon"
                style={{ borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>{selectedLead.companyName}</h3>
                  {selectedLead.website && (
                    <a href={`https://${selectedLead.website}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      {selectedLead.website} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                {selectedLead.aiScore && (
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-score-${selectedLead.aiScore.tier.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                      Tier {selectedLead.aiScore.tier}
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)' }}>
                      {selectedLead.aiScore.score}/100
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Main Contact</h4>
                  <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{selectedLead.contactName}</p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{selectedLead.email}</p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Company Information</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedLead.description}</p>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem' }}>
                    <span><b>Industry:</b> {selectedLead.industry}</span>
                    <span><b>Location:</b> {selectedLead.location}</span>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

                {/* AI assessment section */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} style={{ color: 'var(--accent-light)' }} />
                    AI Fit Analysis
                  </h4>
                  {selectedLead.aiScore ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <h5 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Target Pain Points:</h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedLead.aiScore.painPoints?.map((pain, idx) => (
                            <span key={idx} style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                              {pain}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Analysis:</h5>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                          {selectedLead.aiScore.analysis}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>No qualification report available yet.</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={() => {
                      setSelectedLeadForOutreach(selectedLead);
                      setView('outreach');
                    }}
                    className="btn btn-primary"
                    style={{ flexGrow: 1 }}
                  >
                    <Send size={16} />
                    Write Outreach
                  </button>
                  <button
                    onClick={() => handleRescoreLead(selectedLead)}
                    disabled={scoringLoading}
                    className="btn btn-secondary"
                    title="Recalculate AI Score"
                  >
                    {scoringLoading ? (
                      <div className="spinner" style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Add New Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  required
                  value={newLead.companyName}
                  onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="form-control"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={newLead.contactName}
                    onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="form-control"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="e.g. jane@acme.com"
                    className="form-control"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    required
                    value={newLead.industry}
                    onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                    placeholder="e.g. Technology"
                    className="form-control"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    required
                    value={newLead.location}
                    onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                    placeholder="e.g. New York, NY"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Website (optional)</label>
                <input
                  type="text"
                  value={newLead.website}
                  onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                  placeholder="e.g. www.acme.com"
                  className="form-control"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company Description</label>
                <textarea
                  value={newLead.description}
                  onChange={(e) => setNewLead({ ...newLead, description: e.target.value })}
                  placeholder="Briefly describe what they do or standard challenges..."
                  className="form-control"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="btn btn-secondary"
                  style={{ flexGrow: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={scoringLoading}
                  className="btn btn-primary"
                  style={{ flexGrow: 1 }}
                >
                  {scoringLoading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      AI Scoring...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Add & Score Lead
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Import Leads (CSV Data)</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Paste raw comma-separated CSV rows below. Make sure the headers match the format:<br />
                <code>companyName,contactName,email,website,industry,location</code>
              </p>
              <textarea
                className="form-control"
                rows={8}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="companyName,contactName,email,website,industry,location&#10;Acme Corp,Jane Doe,jane@acme.com,www.acme.com,Software,New York&#10;Globex,John Smith,john@globex.co,www.globex.co,Manufacturing,Austin"
                required
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary" style={{ flexGrow: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  Process & Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
