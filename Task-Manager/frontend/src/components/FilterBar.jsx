import React from 'react';
import "./filterBar.css"

export default function FilterBar({
  status,
  assignee,
  onStatusChange,
  onAssigneeChange,
  statusOptions = ["All", "Todo", "In Progress", "Done"],
  className = "",
}) {
  return (
    <div
      className={`filter-bar ${className}`}
      style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: 12 }}
    >
      {/* Status Dropdown */}
      <label htmlFor="status-filter" className="sr-only">Filter by status</label>
      <select
        id="status-filter"
        className='select-btn'
        value={status}
        onChange={e => onStatusChange(e.target.value)}
        aria-label="Filter by status"
      >
        {statusOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      {/* Assignee Input */}
      <label htmlFor="assignee-filter" className="sr-only">Filter by assignee</label>
      <input
        id="assignee-filter"
        className="select-btn"
        placeholder="Filter by assignee"
        type="text"
        value={assignee}
        onChange={e => onAssigneeChange(e.target.value)}
        aria-label="Filter by assignee"
      />
    </div>
  );
}
