import React from 'react';
import { Users, CheckSquare, Send, DollarSign, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard({ leads, setView }) {
  // Stats Calculations
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted' || l.status === 'in-progress').length;
  
  // Calculate simulated pipeline value
  // Tier A: $10,000, Tier B: $5,000, Tier C: $2,000, Tier D: $500, Unknown: $1,000
  const totalPipelineValue = leads.reduce((acc, lead) => {
    if (lead.status === 'closed') return acc; // ignore closed/done deals or attribute differently
    const tier = lead.aiScore?.tier || 'Unknown';
    switch (tier) {
      case 'A': return acc + 10000;
      case 'B': return acc + 5000;
      case 'C': return acc + 2000;
      case 'D': return acc + 500;
      default: return acc + 1000;
    }
  }, 0);

  // Group by stage for Bar Chart
  const stages = {
    'new': { label: 'New', count: 0 },
    'contacted': { label: 'Contacted', count: 0 },
    'in-progress': { label: 'In Progress', count: 0 },
    'qualified': { label: 'Qualified', count: 0 },
    'closed': { label: 'Closed', count: 0 }
  };
  
  leads.forEach(l => {
    if (stages[l.status]) {
      stages[l.status].count++;
    }
  });

  const maxStageCount = Math.max(...Object.values(stages).map(s => s.count), 1);

  // Lead Tier Distribution for Gauge Circle
  const highFitCount = leads.filter(l => l.aiScore?.tier === 'A' || l.aiScore?.tier === 'B').length;
  const highFitPercent = totalLeads > 0 ? Math.round((highFitCount / totalLeads) * 100) : 0;
  
  // SVG Donut settings
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (highFitPercent / 100) * circumference;

  // Recent leads (max 4)
  const recentLeads = [...leads].slice(-4).reverse();

  return (
    <div className="dashboard-view">
      <div className="header-container">
        <div className="header-title">
          <h1>Lead Analytics Overview</h1>
          <p>Real-time analytics, AI grading breakdown, and sales pipeline distribution.</p>
        </div>
        <button onClick={() => setView('prospector')} className="btn btn-primary">
          <Sparkles size={16} />
          Find New Prospects
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Total Leads</h3>
            <div className="stat-value">{totalLeads}</div>
            <div className="stat-delta up">
              <TrendingUp size={14} />
              <span>Database Size</span>
            </div>
          </div>
          <div className="stat-icon-wrapper accent">
            <Users size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Qualified Fit</h3>
            <div className="stat-value">{qualifiedLeads}</div>
            <div className="stat-delta up">
              <Sparkles size={14} style={{ color: 'var(--success)' }} />
              <span style={{ color: 'var(--success)' }}>AI Tier A & B</span>
            </div>
          </div>
          <div className="stat-icon-wrapper success">
            <CheckSquare size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Outreach Phase</h3>
            <div className="stat-value">{contactedLeads}</div>
            <div className="stat-delta">
              <span>Engaged Leads</span>
            </div>
          </div>
          <div className="stat-icon-wrapper warning">
            <Send size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Pipeline Value</h3>
            <div className="stat-value">
              ${totalPipelineValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="stat-delta up">
              <TrendingUp size={14} />
              <span>Est. Value</span>
            </div>
          </div>
          <div className="stat-icon-wrapper error">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {totalLeads === 0 ? (
        <div className="glass-card empty-state" style={{ padding: '80px 40px' }}>
          <Sparkles size={48} className="pulse" style={{ color: 'var(--accent)' }} />
          <h2>Welcome to Leads AI</h2>
          <p style={{ maxWidth: '500px', margin: '12px auto 24px', color: 'var(--text-secondary)' }}>
            Your pipeline database is currently empty. Get started by simulating mock leads in the settings panel or sourcing real-time leads with the AI Prospector.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setView('settings')} className="btn btn-secondary">
              Go to Settings
            </button>
            <button onClick={() => setView('prospector')} className="btn btn-primary">
              AI Prospector
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="dashboard-grid">
            <div className="glass-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '700' }}>Pipeline Stages</h2>
              <div className="chart-container">
                {Object.entries(stages).map(([key, stage]) => {
                  const percent = (stage.count / maxStageCount) * 100;
                  return (
                    <div className="chart-bar-wrapper" key={key}>
                      <div className="chart-bar" style={{ height: `${percent}%` }}>
                        {stage.count > 0 && <span className="chart-bar-value">{stage.count}</span>}
                      </div>
                      <span className="chart-label">{stage.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', alignSelf: 'flex-start', marginBottom: '20px', fontWeight: '700' }}>AI Qualification</h2>
              <div className="donut-container">
                <svg className="circle-svg">
                  <circle cx="80" cy="80" r={radius} className="circle-bg" />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className={`circle-val ${highFitPercent >= 50 ? 'success' : ''}`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="circle-text-wrapper">
                  <span className="circle-number">{highFitPercent}%</span>
                  <span className="circle-label">High-Fit Ratio</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px' }}>
                Percentage of database scored as <b>Tier A</b> or <b>Tier B</b> by the AI engine.
              </p>
            </div>
          </div>

          {/* Recent Leads Activity */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Leads Added</h2>
              <button onClick={() => setView('leads')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                View Database
              </button>
            </div>
            <div className="table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact Person</th>
                    <th>Industry</th>
                    <th>Score Tier</th>
                    <th>Pipeline Stage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: '600' }}>{lead.companyName}</td>
                      <td>{lead.contactName}</td>
                      <td>{lead.industry}</td>
                      <td>
                        {lead.aiScore ? (
                          <span className={`badge badge-score-${lead.aiScore.tier.toLowerCase()}`}>
                            Tier {lead.aiScore.tier} ({lead.aiScore.score})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Not Scored</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-status ${lead.status}`}>
                          {lead.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setView('leads')}
                          className="btn btn-secondary btn-icon"
                          title="Open Details Drawer"
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      </td>
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
