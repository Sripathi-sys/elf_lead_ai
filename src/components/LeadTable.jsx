import React, { useState } from 'react';
import {
  Search, Plus, Download, Upload, Trash2, Eye,
  ArrowUpDown, ExternalLink, X, AlertCircle
} from 'lucide-react';

export default function LeadTable({
  leads, onAddLead, onDeleteLead, onUpdateLeadField, setView
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('all');
  const [adsFilter, setAdsFilter] = useState('all');
  const [sortField, setSortField] = useState('companyName');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal and Drawer States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form states using simple English
  const [newLead, setNewLead] = useState({
    companyName: '',
    contactNumber: '',
    websiteStatus: 'Active website',
    websiteUrl: '',
    instagramLink: '',
    facebookLink: '',
    metaAdsStatus: 'Active',
    instagramFollowers: '',
    businessType: ''
  });
  const [importText, setImportText] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const leadItem = {
      ...newLead,
      id: 'lead_' + Date.now(),
      createdAt: new Date().toISOString()
    };

    onAddLead(leadItem);
    setIsAddModalOpen(false);
    setNewLead({
      companyName: '',
      contactNumber: '',
      websiteStatus: 'Active website',
      websiteUrl: '',
      instagramLink: '',
      facebookLink: '',
      metaAdsStatus: 'Active',
      instagramFollowers: '',
      businessType: ''
    });
  };

  // CSV Export structured specifically for Excel
  const handleExportCSV = () => {
    if (leads.length === 0) return;

    // Exact 8 headers requested
    const headers = [
      'Company Name',
      'WhatsApp and Mobile Number',
      'Website Status',
      'Website Link',
      'Instagram Link',
      'Facebook Page Link',
      'Meta Ads Status',
      'Instagram Followers',
      'Business Type'
    ];

    const rows = leads.map(l => [
      l.companyName,
      l.contactNumber,
      l.websiteStatus,
      l.websiteUrl || '',
      l.instagramLink,
      l.facebookLink,
      l.metaAdsStatus,
      l.instagramFollowers,
      l.businessType
    ]);

    // Use BOM (Byte Order Mark) so Excel opens UTF-8 characters (like +91) correctly
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `businesses_marketing_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import (Simple comma-delimited parser)
  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    if (lines.length < 2) return;

    const parsedLeads = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      if (matches.length < 3) continue;

      const clean = (val) => val ? val.replace(/^"|"$/g, '').trim() : '';

      parsedLeads.push({
        id: 'lead_csv_' + Date.now() + '_' + i,
        companyName: clean(matches[0]),
        contactNumber: clean(matches[1]),
        websiteStatus: clean(matches[2]) || 'Active website',
        websiteUrl: clean(matches[3]) || '',
        instagramLink: clean(matches[4]) || '',
        facebookLink: clean(matches[5]) || 'no page',
        metaAdsStatus: clean(matches[6]) || 'Active',
        instagramFollowers: clean(matches[7]) || '0 followers',
        businessType: clean(matches[8]) || 'Business',
        createdAt: new Date().toISOString()
      });
    }

    parsedLeads.forEach(lead => onAddLead(lead));
    setIsImportModalOpen(false);
    setImportText('');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filters logic matching our simplified keys
  const filteredLeads = leads.filter(lead => {
    const searchString = `${lead.companyName} ${lead.contactNumber} ${lead.businessType} ${lead.instagramLink} ${lead.instagramFollowers}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Website filter matches
    let matchesWebsite = true;
    if (websiteFilter !== 'all') {
      matchesWebsite = lead.websiteStatus === websiteFilter;
    }

    // Ads filter matches
    let matchesAds = true;
    if (adsFilter !== 'all') {
      matchesAds = lead.metaAdsStatus === adsFilter;
    }

    return matchesSearch && matchesWebsite && matchesAds;
  }).sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="database-view">
      {/* Header Panel */}
      <div className="header-container">
        <div className="header-title">
          <h1>Leads Table</h1>
          <p>Organize, search, and export your collected company data into Excel files.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ color: 'var(--accent)' }}>
            <Download size={16} />
            Excel Export
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary">
            <Upload size={16} />
            Import CSV
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            Add Business
          </button>
        </div>
      </div>

      {/* Filters Panel - Simple English */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search saved businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input"
            style={{ paddingLeft: '44px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="glass-input"
            style={{ width: '170px', cursor: 'pointer' }}
          >
            <option value="all">All Websites</option>
            <option value="Active website">Active website</option>
            <option value="Have website but inactive">Have website but inactive</option>
            <option value="No website">No website</option>
          </select>

          <select
            value={adsFilter}
            onChange={(e) => setAdsFilter(e.target.value)}
            className="glass-input"
            style={{ width: '170px', cursor: 'pointer' }}
          >
            <option value="all">All Ads Statuses</option>
            <option value="Active">Active Ads</option>
            <option value="Have page but inactive ads or no ads">Inactive / No Ads</option>
            <option value="No page no ads">No page no ads</option>
          </select>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} />
            <h3>No Businesses Found</h3>
            <p>Try clearing your search terms or filter selection.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('companyName')}>
                    Company Name <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('contactNumber')}>
                    Contact Numbers <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th>Website Status</th>
                  <th>Instagram Link</th>
                  <th>Facebook Link</th>
                  <th>Ads Status (Ads Library)</th>
                  <th>Followers</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('businessType')}>
                    Type <ArrowUpDown size={12} style={{ marginLeft: '6px', display: 'inline' }} />
                  </th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {lead.companyName}
                    </td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {lead.contactNumber}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge ${lead.websiteStatus === 'Active website' ? 'badge-web-active' : lead.websiteStatus === 'No website' ? 'badge-web-none' : 'badge-web-inactive'}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          {lead.websiteStatus}
                        </span>
                        {lead.websiteUrl && (
                          <a href={`https://${lead.websiteUrl}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '0.78rem', color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            {lead.websiteUrl.substring(0, 22)}... <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      {lead.instagramLink ? (
                        <a href={`https://${lead.instagramLink}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.82rem' }}>
                          @{lead.instagramLink.split('/').pop()}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>none</span>
                      )}
                    </td>
                    <td>
                      {lead.facebookLink === 'no page' ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>no page</span>
                      ) : lead.facebookLink ? (
                        <a href={`https://${lead.facebookLink}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.82rem' }}>
                          fb.com/{lead.facebookLink.split('/').pop()}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>none</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${lead.metaAdsStatus === 'Active' ? 'badge-ads-active' : lead.metaAdsStatus === 'No page no ads' ? 'badge-web-none' : 'badge-ads-inactive'}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                        {lead.metaAdsStatus}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{lead.instagramFollowers}</td>
                    <td style={{ fontSize: '0.85rem' }}>{lead.businessType}</td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="btn btn-secondary btn-icon"
                          title="Open Details"
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

      {/* Detail Sliding Drawer */}
      <div className={`drawer ${selectedLead ? 'open' : ''}`}>
        {selectedLead && (
          <>
            <div className="drawer-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Company Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="btn btn-secondary btn-icon"
                style={{ borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>{selectedLead.companyName}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type: <b>{selectedLead.businessType}</b></span>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Contact Details</h4>
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{selectedLead.contactNumber}</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Website Audit</h4>
                <span className={`badge ${selectedLead.websiteStatus === 'Active website' ? 'badge-web-active' : selectedLead.websiteStatus === 'No website' ? 'badge-web-none' : 'badge-web-inactive'}`} style={{ marginBottom: '8px' }}>
                  {selectedLead.websiteStatus}
                </span>
                {selectedLead.websiteUrl && (
                  <p style={{ fontSize: '0.9rem' }}>
                    URL: <a href={`https://${selectedLead.websiteUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      {selectedLead.websiteUrl}
                    </a>
                  </p>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Social Profiles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <span><b>Instagram:</b> {selectedLead.instagramLink ? (
                    <a href={`https://${selectedLead.instagramLink}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>@{selectedLead.instagramLink.split('/').pop()}</a>
                  ) : 'no link'}</span>
                  <span><b>Followers:</b> {selectedLead.instagramFollowers}</span>
                  <span><b>Facebook:</b> {selectedLead.facebookLink === 'no page' ? 'no page' : selectedLead.facebookLink ? (
                    <a href={`https://${selectedLead.facebookLink}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>fb.com/{selectedLead.facebookLink.split('/').pop()}</a>
                  ) : 'no link'}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Meta Ads Library Status</h4>
                <span className={`badge ${selectedLead.metaAdsStatus === 'Active' ? 'badge-ads-active' : selectedLead.metaAdsStatus === 'No page no ads' ? 'badge-web-none' : 'badge-ads-inactive'}`}>
                  {selectedLead.metaAdsStatus === 'Active' ? 'Running Active Ads' : selectedLead.metaAdsStatus === 'No page no ads' ? 'No page no ads' : 'Inactive Ads / No Ads Running'}
                </span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Close Details
                </button>
              </div>
            </>
          )}
          </div>

        {/* Add Lead Modal - Simple English */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Add Business Manually</h2>
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
                    placeholder="e.g. HB Construction Chennai"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">WhatsApp & Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={newLead.contactNumber}
                    onChange={(e) => setNewLead({ ...newLead, contactNumber: e.target.value })}
                    placeholder="e.g. WhatsApp: +91 98401 54321 / Mobile: +91 94440 98765"
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Website Status</label>
                    <select
                      value={newLead.websiteStatus}
                      onChange={(e) => setNewLead({ ...newLead, websiteStatus: e.target.value })}
                      className="form-control"
                    >
                      <option value="Active website">Active website</option>
                      <option value="Have website but inactive">Have website but inactive</option>
                      <option value="No website">No website</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Website Link</label>
                    <input
                      type="text"
                      value={newLead.websiteUrl}
                      onChange={(e) => setNewLead({ ...newLead, websiteUrl: e.target.value })}
                      placeholder="e.g. www.hbc.com"
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Instagram Link</label>
                    <input
                      type="text"
                      value={newLead.instagramLink}
                      onChange={(e) => setNewLead({ ...newLead, instagramLink: e.target.value })}
                      placeholder="instagram.com/handle"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Instagram Followers</label>
                    <input
                      type="text"
                      value={newLead.instagramFollowers}
                      onChange={(e) => setNewLead({ ...newLead, instagramFollowers: e.target.value })}
                      placeholder="e.g. 2,400 followers"
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Facebook Page Link</label>
                    <input
                      type="text"
                      value={newLead.facebookLink}
                      onChange={(e) => setNewLead({ ...newLead, facebookLink: e.target.value })}
                      placeholder="facebook.com/page (or no page)"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Ads Status (Meta Ads)</label>
                    <select
                      value={newLead.metaAdsStatus}
                      onChange={(e) => setNewLead({ ...newLead, metaAdsStatus: e.target.value })}
                      className="form-control"
                    >
                      <option value="Active">Active</option>
                      <option value="Have page but inactive ads or no ads">Have page but inactive ads or no ads</option>
                      <option value="No page no ads">No page no ads</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Business Type / Category</label>
                  <input
                    type="text"
                    required
                    value={newLead.businessType}
                    onChange={(e) => setNewLead({ ...newLead, businessType: e.target.value })}
                    placeholder="e.g. Construction Company, Bridal Studio"
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary" style={{ flexGrow: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                    Save Business
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
              <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Import Businesses</h2>
                <button onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%' }}>
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Paste comma-separated CSV rows below. Headers must match:<br />
                  <code>companyName,contactNumber,websiteStatus,websiteUrl,instagramLink,facebookLink,metaAdsStatus,instagramFollowers,businessType</code>
                </p>
                <textarea
                  className="form-control"
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="HB Construction,WhatsApp: +91 984...,Active website,www.hbc.com,instagram.com/hbc,facebook.com/hbc,Active,2800 followers,Construction Company"
                  required
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary" style={{ flexGrow: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                    Import Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      );
}
