import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, Send } from 'lucide-react';

export default function Kanban({ leads, onUpdateLeadStage, setView, setSelectedLeadForOutreach }) {
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  const columns = [
    { key: 'new', title: 'New', count: leads.filter(l => l.status === 'new').length },
    { key: 'contacted', title: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { key: 'in-progress', title: 'In Progress', count: leads.filter(l => l.status === 'in-progress').length },
    { key: 'qualified', title: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
    { key: 'closed', title: 'Closed', count: leads.filter(l => l.status === 'closed').length }
  ];

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    setDraggedOverColumn(columnKey);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e, targetColumnKey) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      onUpdateLeadStage(leadId, targetColumnKey);
    }
  };

  return (
    <div className="kanban-view">
      <div className="header-container">
        <div className="header-title">
          <h1>Kanban Pipeline</h1>
          <p>Drag and drop leads to advance their outreach stage and manage deals visually.</p>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map((column) => {
          const columnLeads = leads.filter(l => l.status === column.key);
          const isDragOver = draggedOverColumn === column.key;

          return (
            <div
              key={column.key}
              className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-title">{column.title}</span>
                <span className="kanban-column-count">{column.count}</span>
              </div>

              {columnLeads.length === 0 ? (
                <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', minHeight: '120px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  No leads in stage
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                  >
                    <div className="kanban-card-company">{lead.companyName}</div>
                    <div className="kanban-card-contact">{lead.contactName}</div>
                    
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
                        {lead.industry}
                      </span>
                    </div>

                    <div className="kanban-card-footer">
                      <div>
                        {lead.aiScore ? (
                          <span className={`badge badge-score-${lead.aiScore.tier.toLowerCase()}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                            Tier {lead.aiScore.tier} ({lead.aiScore.score})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Unscored
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => {
                            setSelectedLeadForOutreach(lead);
                            setView('outreach');
                          }}
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '4px' }}
                          title="Generate Outreach Email"
                        >
                          <Send size={12} />
                        </button>
                        <button
                          onClick={() => {
                            // Quick way to open details is going to the database and selecting it
                            setView('leads');
                          }}
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '4px' }}
                          title="View Database Profile"
                        >
                          <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
