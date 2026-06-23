import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Search, Database, Settings as SettingsIcon, Sparkles
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import LeadTable from './components/LeadTable';
import Prospector from './components/Prospector';
import Settings from './components/Settings';

export default function App() {
  const [view, setView] = useState('prospector');
  const [leads, setLeads] = useState([]);
  
  // Default Settings Profile using simple English
  const [settings, setSettings] = useState({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    senderName: 'Sanjay Kumar',
    senderTitle: 'Marketing Manager',
    companyName: 'Chennai Digital Media',
    companyDescription: 'We help local businesses run Meta Ads, set up WhatsApp chat tools, and build active websites.',
    valueProposition: 'Getting more local inquiries and phone calls for your business using Instagram Ads and WhatsApp outreach.'
  });

  // Load from local storage
  useEffect(() => {
    const savedLeads = localStorage.getItem('leads_ai_data');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      setLeads([]);
    }

    const savedSettings = localStorage.getItem('leads_ai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (!parsed.apiKey && import.meta.env.VITE_GEMINI_API_KEY) {
        parsed.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      }
      setSettings(parsed);
    }
  }, []);

  // Save changes helper
  const saveLeadsToStorage = (updatedLeads) => {
    setLeads(updatedLeads);
    localStorage.setItem('leads_ai_data', JSON.stringify(updatedLeads));
  };

  // State action handlers using plain names
  const handleAddLead = (newLead) => {
    // Prevent duplicate entries
    if (leads.some(l => l.companyName.toLowerCase() === newLead.companyName.toLowerCase())) {
      return;
    }
    const updated = [...leads, newLead];
    saveLeadsToStorage(updated);
  };

  const handleDeleteLead = (leadId) => {
    const updated = leads.filter(l => l.id !== leadId);
    saveLeadsToStorage(updated);
  };

  const handleUpdateLeadField = (leadId, fieldName, fieldValue) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, [fieldName]: fieldValue } : l);
    saveLeadsToStorage(updated);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('leads_ai_settings', JSON.stringify(newSettings));
  };

  // Load digital marketing demo data matching your 8 columns
  const handleLoadDemoData = () => {
    const demoLeads = [
      {
        id: 'demo_1',
        companyName: 'HB Construction Chennai',
        contactNumber: 'WhatsApp: +91 98401 54321 / Mobile: +91 94440 98765',
        websiteStatus: 'Active website',
        websiteUrl: 'www.hbconstructionchennai.com',
        instagramLink: 'instagram.com/hbconstruction_chennai',
        facebookLink: 'facebook.com/hbconstructionchennai',
        metaAdsStatus: 'Active',
        instagramFollowers: '2,850 followers',
        businessType: 'Construction Company',
        location: 'Adyar, Chennai',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      },
      {
        id: 'demo_2',
        companyName: 'Deepam Bridal Boutique',
        contactNumber: 'WhatsApp: +91 98840 12345 / Mobile: +91 90030 54321',
        websiteStatus: 'Have website but inactive',
        websiteUrl: 'www.deepambridal.com',
        instagramLink: 'instagram.com/deepam_bridal_chennai',
        facebookLink: 'facebook.com/deepambridal',
        metaAdsStatus: 'Have page but inactive ads or no ads',
        instagramFollowers: '24,500 followers',
        businessType: 'Bridal Shop & Boutique',
        location: 'T. Nagar, Chennai',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'demo_3',
        companyName: 'Studio 3 Architects',
        contactNumber: 'WhatsApp: +91 98410 87654 / Mobile: +91 98845 11223',
        websiteStatus: 'Active website',
        websiteUrl: 'www.studio3architects.in',
        instagramLink: 'instagram.com/studio3_architects',
        facebookLink: 'facebook.com/studio3architects',
        metaAdsStatus: 'Active',
        instagramFollowers: '8,900 followers',
        businessType: 'Architectural Firm',
        location: 'Nungambakkam, Chennai',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'demo_4',
        companyName: 'Anjappar Chennai Food',
        contactNumber: 'WhatsApp: +91 94444 77889 / Mobile: +91 98409 66778',
        websiteStatus: 'Active website',
        websiteUrl: 'www.anjapparchennai.com',
        instagramLink: 'instagram.com/anjappar_restaurant',
        facebookLink: 'facebook.com/anjapparrestaurant',
        metaAdsStatus: 'Have page but inactive ads or no ads',
        instagramFollowers: '15,200 followers',
        businessType: 'Food & Restaurant',
        location: 'Egmore, Chennai',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'demo_5',
        companyName: 'Chennai Decorators',
        contactNumber: 'WhatsApp: +91 90031 99001 / Mobile: +91 94450 55667',
        websiteStatus: 'No website',
        websiteUrl: '',
        instagramLink: 'instagram.com/chennai_decorators',
        facebookLink: 'no page',
        metaAdsStatus: 'No page no ads',
        instagramFollowers: '950 followers',
        businessType: 'Interior Designer',
        location: 'Velachery, Chennai',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
    saveLeadsToStorage(demoLeads);
  };

  // Clear Database
  const handleClearData = () => {
    if (confirm("Are you sure you want to delete all businesses from your excel sheet? This cannot be undone.")) {
      saveLeadsToStorage([]);
    }
  };

  // Switch views
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
            onUpdateLeadField={handleUpdateLeadField}
            settings={settings}
            setView={setView}
          />
        );
      case 'prospector':
        return (
          <Prospector
            settings={settings}
            onAddLead={handleAddLead}
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
              onClick={() => setView('prospector')} 
              className={`nav-item ${view === 'prospector' ? 'active' : ''}`}
            >
              <Search size={18} />
              <span className="nav-text">Research Desk</span>
            </div>
          </li>
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
              <span className="nav-text">Leads Table</span>
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
