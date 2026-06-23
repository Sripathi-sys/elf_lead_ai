import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Database, Kanban as KanbanIcon, 
  Sparkles, Send, Settings as SettingsIcon, Menu, ArrowRight
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import LeadTable from './components/LeadTable';
import Kanban from './components/Kanban';
import Prospector from './components/Prospector';
import Outreach from './components/Outreach';
import Settings from './components/Settings';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [selectedLeadForOutreach, setSelectedLeadForOutreach] = useState(null);
  
  // Default Settings Profile
  const [settings, setSettings] = useState({
    apiKey: '',
    senderName: 'Alex Rivera',
    senderTitle: 'Founder & CEO',
    companyName: 'GrowthSpace',
    companyDescription: 'We build premium web applications, dashboards, and automated lead intelligence pipelines for tech startups.',
    valueProposition: 'Helping startups design, build, and launch features 4x faster with modern React code and tailored B2B outreach integrations.'
  });

  // Load from local storage
  useEffect(() => {
    const savedLeads = localStorage.getItem('leads_ai_data');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      // Load initial empty list or mock
      setLeads([]);
    }

    const savedSettings = localStorage.getItem('leads_ai_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save changes helper
  const saveLeadsToStorage = (updatedLeads) => {
    setLeads(updatedLeads);
    localStorage.setItem('leads_ai_data', JSON.stringify(updatedLeads));
  };

  // State action handlers
  const handleAddLead = (newLead) => {
    // Check if lead already exists by email
    if (leads.some(l => l.email === newLead.email && l.companyName === newLead.companyName)) {
      return;
    }
    const updated = [...leads, newLead];
    saveLeadsToStorage(updated);
  };

  const handleDeleteLead = (leadId) => {
    const updated = leads.filter(l => l.id !== leadId);
    saveLeadsToStorage(updated);
    if (selectedLeadForOutreach?.id === leadId) {
      setSelectedLeadForOutreach(null);
    }
  };

  const handleUpdateLeadStage = (leadId, newStage) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStage } : l);
    saveLeadsToStorage(updated);
    if (selectedLeadForOutreach?.id === leadId) {
      setSelectedLeadForOutreach(prev => ({ ...prev, status: newStage }));
    }
  };

  const handleUpdateLeadAI = (leadId, aiScore) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, aiScore } : l);
    saveLeadsToStorage(updated);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('leads_ai_settings', JSON.stringify(newSettings));
  };

  // Load High-Fidelity Demo Data
  const handleLoadDemoData = () => {
    const demoLeads = [
      {
        id: 'demo_1',
        companyName: 'Quantum SaaS Technologies',
        contactName: 'Robert Chen',
        email: 'r.chen@quantumsaas.io',
        website: 'www.quantumsaas.io',
        industry: 'SaaS / Tech',
        location: 'San Francisco, CA',
        status: 'qualified',
        source: 'Demo Pipeline',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        aiScore: {
          score: 92,
          tier: 'A',
          painPoints: ['Developer recruitment friction', 'High client onboarding churn', 'API performance degradation'],
          analysis: 'Excellent match. The company is actively building security tech, aligned directly with custom React development and dashboard automation. Budget availability is high.'
        }
      },
      {
        id: 'demo_2',
        companyName: 'Bright Smiles Dental Care',
        contactName: 'Dr. Amanda Ross',
        email: 'amanda@brightsmiles.care',
        website: 'www.brightsmiles.care',
        industry: 'Dental Clinics',
        location: 'Boston, MA',
        status: 'contacted',
        source: 'Demo Pipeline',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        aiScore: {
          score: 84,
          tier: 'B',
          painPoints: ['Patient booking drop-offs', 'High manual appointment followups', 'Inefficient staff scheduling'],
          analysis: 'Strong fit for custom web integration. Dr. Ross manages 2 office locations looking to implement patient text reminders and online confirmation dashboards. Good budget capacity.'
        }
      },
      {
        id: 'demo_3',
        companyName: 'Velo E-Commerce Brands',
        contactName: 'Tyler Miller',
        email: 'tyler.m@veloshops.com',
        website: 'www.veloshops.com',
        industry: 'E-commerce Brands',
        location: 'Remote',
        status: 'new',
        source: 'Demo Pipeline',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        aiScore: {
          score: 76,
          tier: 'B',
          painPoints: ['Shopping cart abandonment rate', 'Manual wholesale orders processing', 'Inventory sync latency'],
          analysis: 'Moderate to high fit. Online cycling retailer experiencing substantial order scale but bogged down by manual data entry between Shopify and QuickBooks. Ready for custom automation.'
        }
      },
      {
        id: 'demo_4',
        companyName: 'Apex Digital Agency',
        contactName: 'Chloe Vance',
        email: 'chloe@apexagency.co',
        website: 'www.apexagency.co',
        industry: 'Digital Agencies',
        location: 'London, UK',
        status: 'in-progress',
        source: 'Demo Pipeline',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        aiScore: {
          score: 68,
          tier: 'C',
          painPoints: ['Client report compilation time', 'Prospect pitch mockups creation', 'High contractor margins'],
          analysis: 'Boutique agency managing local client campaigns. Highly interested in dashboard automation to save manual tracking sheets, but has a tighter development budget.'
        }
      },
      {
        id: 'demo_5',
        companyName: 'Horizon Homes Real Estate',
        contactName: 'Marcus Sterling',
        email: 'marcus@horizonhomes.net',
        website: 'www.horizonhomes.net',
        industry: 'Real Estate Brokers',
        location: 'Miami, FL',
        status: 'closed',
        source: 'Demo Pipeline',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
        aiScore: {
          score: 88,
          tier: 'A',
          painPoints: ['Zillow lead routing latency', 'Agent performance analytics gaps', 'CRM manual sync errors'],
          analysis: 'Outstanding opportunity. Large brokerage office with 35 active agents. Experiencing deal leakage due to slow response times on internet portal leads. Needs instant routing automation.'
        }
      }
    ];
    saveLeadsToStorage(demoLeads);
  };

  // Clear Database
  const handleClearData = () => {
    if (confirm("Are you sure you want to delete all leads from your local database? This cannot be undone.")) {
      saveLeadsToStorage([]);
      setSelectedLeadForOutreach(null);
    }
  };

  // View Switcher logic
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard leads={leads} setView={setView} />;
      case 'leads':
        return (
          <LeadTable
            leads={leads}
            onAddLead={handleAddLead}
            onDeleteLead={handleDeleteLead}
            onUpdateLeadStage={handleUpdateLeadStage}
            onUpdateLeadAI={handleUpdateLeadAI}
            settings={settings}
            setView={setView}
            setSelectedLeadForOutreach={setSelectedLeadForOutreach}
          />
        );
      case 'kanban':
        return (
          <Kanban
            leads={leads}
            onUpdateLeadStage={handleUpdateLeadStage}
            setView={setView}
            setSelectedLeadForOutreach={setSelectedLeadForOutreach}
          />
        );
      case 'prospector':
        return (
          <Prospector
            settings={settings}
            onAddLead={handleAddLead}
            leads={leads}
          />
        );
      case 'outreach':
        return (
          <Outreach
            leads={leads}
            selectedLead={selectedLeadForOutreach}
            onSelectLead={setSelectedLeadForOutreach}
            settings={settings}
            onUpdateLeadStage={handleUpdateLeadStage}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onLoadDemoData={handleLoadDemoData}
            onClearData={handleClearData}
          />
        );
      default:
        return <Dashboard leads={leads} setView={setView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <span className="logo-text">Leads AI</span>
        </div>

        <ul className="nav-links">
          <li>
            <div 
              onClick={() => setView('dashboard')} 
              className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span className="nav-text">Dashboard</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => setView('leads')} 
              className={`nav-item ${view === 'leads' ? 'active' : ''}`}
            >
              <Database size={18} />
              <span className="nav-text">Leads Database</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => setView('kanban')} 
              className={`nav-item ${view === 'kanban' ? 'active' : ''}`}
            >
              <KanbanIcon size={18} />
              <span className="nav-text">Kanban Pipeline</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => setView('prospector')} 
              className={`nav-item ${view === 'prospector' ? 'active' : ''}`}
            >
              <Sparkles size={18} />
              <span className="nav-text">AI Prospector</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => setView('outreach')} 
              className={`nav-item ${view === 'outreach' ? 'active' : ''}`}
            >
              <Send size={18} />
              <span className="nav-text">AI Outreach</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => setView('settings')} 
              className={`nav-item ${view === 'settings' ? 'active' : ''}`}
            >
              <SettingsIcon size={18} />
              <span className="nav-text">Settings</span>
            </div>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="profile-avatar">
            {settings.senderName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="profile-info">
            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '140px' }}>
              {settings.senderName}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '140px' }}>
              {settings.companyName}
            </span>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}
