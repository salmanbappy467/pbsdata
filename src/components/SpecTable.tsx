'use client';
import React, { useState } from 'react';
import ContributorList from './ContributorList';

export default function SpecTable({ 
  noteId, 
  specs, 
  user, 
  onUpdate 
}: { 
  noteId: string; 
  specs: any; 
  user: any; 
  onUpdate: () => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [rows, setRows] = useState(specs?.rows || []);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { name: '', value: [''] }]);
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleValueChange = (rowIndex: number, valIndex: number, value: string) => {
    const updated = [...rows];
    updated[rowIndex].value[valIndex] = value;
    setRows(updated);
  };

  const handleAddValueLine = (rowIndex: number) => {
    const updated = [...rows];
    updated[rowIndex].value.push('');
    setRows(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/specs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to save specs', err);
    }
    setLoading(false);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const hasPending = specs?.status === 'pending';

  return (
    <div className="spec-section glass-card animate-fade">
      <div className="section-header-inline">
        <h3 className="section-title">Specifications</h3>
        {user && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-edit-icon" title="Edit Specifications">
            <svg className="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {hasPending && !isEditing && (
        <div className="pending-notice">
          <p>⚠️ There are pending updates for this specification. Only approved data is shown below.</p>
        </div>
      )}

      {isEditing ? (
        <div className="edit-mode animate-fade">
          <div className="edit-table-container">
            {rows.map((row: any, idx: number) => (
              <div key={idx} className="edit-row glass animate-fade">
                <div className="edit-row-top">
                  <input 
                    placeholder="Spec Name (e.g. Rated Voltage)" 
                    value={row.name}
                    onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                    className="edit-input-full"
                  />
                  <button onClick={() => setRows(rows.filter((_:any, i:number) => i !== idx))} className="btn-remove">×</button>
                </div>
                <div className="edit-values">
                  {row.value.map((val: string, vIdx: number) => (
                    <input 
                      key={vIdx}
                      placeholder="Value (e.g. 230V)" 
                      value={val}
                      onChange={(e) => handleValueChange(idx, vIdx, e.target.value)}
                      className="edit-input-full"
                    />
                  ))}
                  <button onClick={() => handleAddValueLine(idx)} className="btn-add-line">+ Add Value Line</button>
                </div>
              </div>
            ))}
          </div>
          <div className="edit-actions">
            <button onClick={handleAddRow} className="btn-add-row">+ Add New Spec Row</button>
            <div className="right-btns">
              <button onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleSave} className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : isAdmin ? 'Save Approved' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="display-mode-outer">
          <div className={`display-mode-limit ${showAll ? 'expanded' : ''}`}>
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {specs?.rows?.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="row-name"><b>{row.name}</b></td>
                    <td className="row-values">
                      {row.value.map((v: string, i: number) => (
                        <div key={i} className="val-line">{v}</div>
                      ))}
                    </td>
                  </tr>
                ))}
                {(!specs?.rows || specs.rows.length === 0) && (
                  <tr>
                    <td colSpan={2} className="empty-row text-center">No specifications added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {specs?.rows?.length > 8 && (
            <div className="more-btn-wrap">
              <button onClick={() => setShowAll(!showAll)} className="btn-show-more">
                {showAll ? 'Show Less' : 'Show All Specifications'}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
