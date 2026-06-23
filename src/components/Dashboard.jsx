import React from 'react';
import { Database, Globe, Megaphone, Users, Sparkles } from 'lucide-react';

export default function Dashboard({ leads, setView }) {
  // Simple KPI Calculations
  const totalSaved = leads.length;
  const activeWebsites = leads.filter(l => l.websiteStatus === 'Active website').length;
  const activeAds = leads.filter(l => l.metaAdsStatus === 'Active').length;
  
  // Sum Instagram followers (parse numbers like "12,500 followers" -> 12500)
  const totalFollowers = leads.reduce((sum, lead) => {
    const raw = lead.instagramFollowers || "";
    const match = raw.replace(/[^0-9]/g, '');
    const num = parseInt(match, 10);
    return isNaN(num) ? sum : sum + num;
  }, 0);

  // Group by category/type for Bar Chart
  const categories = {};
  leads.forEach(l => {
    const type = l.businessType || 'Other';
    categories[type] = (categories[type] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(categories), 1);

  // Ads Ratio calculations
  const runAdsCount = leads.filter(l => l.metaAdsStatus === 'Active').length;
  const adsPercent = totalSaved > 0 ? Math.round((runAdsCount / totalSaved) * 100) : 0;

  // SVG Donut settings
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (adsPercent / 100) * circumference;

  // Recent businesses (max 4)
  const recentLeads = [...leads].slice(-4).reverse();

  return (
    <div className="dashboard-view">
      <div className="header-container">
        <div className="header-title">
          <h1>Businesses Research Dashboard</h1>
          <p>View stats on website active rates, social audience sizes, and active advertising statuses.</p>
        </div>
        <button onClick={() => setView('prospector')} className="btn btn-primary">
          <Sparkles size={16} />
          Research New Company
        </button>
      </div>

      {/* KPI Stats Grid - Simple English */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Saved Businesses</h3>
            <div className="stat-value">{totalSaved}</div>
            <div className="stat-delta">
              <span>Total in database</span>
            </div>
          </div>
          <div className="stat-icon-wrapper accent">
            <Database size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Active Websites</h3>
            <div className="stat-value">{activeWebsites}</div>
            <div className="stat-delta up">
              <span style={{ color: 'var(--success)' }}>Websites running</span>
            </div>
          </div>
          <div className="stat-icon-wrapper success">
            <Globe size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Running Meta Ads</h3>
            <div className="stat-value">{activeAds}</div>
            <div className="stat-delta">
              <span>Currently active ads</span>
            </div>
          </div>
          <div className="stat-icon-wrapper warning">
            <Megaphone size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Instagram Followers</h3>
            <div className="stat-value">
              {totalFollowers >= 1000 ? `${(totalFollowers / 1000).toFixed(1)}k` : totalFollowers}
            </div>
            <div className="stat-delta">
              <span>Total social reach</span>
            </div>
          </div>
          <div className="stat-icon-wrapper error">
            <Users size={22} />
          </div>
        </div>
      </div>

      {totalSaved === 0 ? (
        <div className="glass-card empty-state" style={{ padding: '80px 40px' }}>
          <Sparkles size={48} className="pulse" style={{ color: 'var(--accent)' }} />
          <h2>No Data Found</h2>
          <p style={{ maxWidth: '500px', margin: '12px auto 24px', color: 'var(--text-secondary)' }}>
            Your saved businesses list is currently empty. Go to the Settings page to load demo businesses or use the Research Desk to search a company.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setView('settings')} className="btn btn-secondary">
              Go to Settings
            </button>
            <button onClick={() => setView('prospector')} className="btn btn-primary">
              Open Research Desk
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="dashboard-grid">
            <div className="glass-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '700' }}>Types of Businesses</h2>
              {Object.keys(categories).length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No categories recorded</p>
              ) : (
                <div className="chart-container">
                  {Object.entries(categories).map(([key, count]) => {
                    const percent = (count / maxCount) * 100;
                    return (
                      <div className="chart-bar-wrapper" key={key}>
                        <div className="chart-bar" style={{ height: `${percent}%` }}>
                          <span className="chart-bar-value">{count}</span>
                        </div>
                        <span className="chart-label">{key}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', alignSelf: 'flex-start', marginBottom: '20px', fontWeight: '700' }}>Advertising Ratio</h2>
              <div className="donut-container">
                <svg className="circle-svg">
                  <circle cx="80" cy="80" r={radius} className="circle-bg" />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="circle-val"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="circle-text-wrapper">
                  <span className="circle-number">{adsPercent}%</span>
                  <span className="circle-label">Running Ads</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px' }}>
                Percentage of businesses in your table currently running active Meta ads campaigns.
              </p>
            </div>
          </div>

          {/* Recent Businesses List */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Businesses Added</h2>
              <button onClick={() => setView('leads')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                Open Leads Table
              </button>
            </div>
            <div className="table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Business Type</th>
                    <th>Contact Numbers</th>
                    <th>Website Status</th>
                    <th>Ads Status</th>
                    <th>Followers</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: '700' }}>{lead.companyName}</td>
                      <td>{lead.businessType}</td>
                      <td style={{ fontSize: '0.85rem' }}>{lead.contactNumber}</td>
                      <td>
                        <span className={`badge badge-web-${lead.websiteStatus === 'Active website' ? 'active' : lead.websiteStatus === 'No website' ? 'none' : 'inactive'}`}>
                          {lead.websiteStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-ads-${lead.metaAdsStatus === 'Active' ? 'active' : lead.metaAdsStatus === 'No page no ads' ? 'none' : 'inactive'}`}>
                          {lead.metaAdsStatus === 'Active' ? 'Active Ads' : lead.metaAdsStatus === 'No page no ads' ? 'No page no ads' : 'Inactive Ads'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{lead.instagramFollowers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
