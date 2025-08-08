import React from 'react';

export const InputField = ({ 
  label, 
  value, 
  onChange, 
  onKeyDown,       
  placeholder, 
  type = "text", 
  className = "" 
}) => {
  return (
    <div className={`input-field ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}  
        placeholder={placeholder}
        className={`input-control ${className === 'narrow' ? 'narrow' : ''}`}
      />
    </div>
  );
};

export const TextAreaField = ({ 
  label, 
  value, 
  onChange, 
  onKeyDown,        
  placeholder, 
  className = "" 
}) => {
  return (
    <div className={className}>
      <label className="input-label">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}  
        placeholder={placeholder}
        rows={2}
        className="textarea-control"
      />
    </div>
  );
};

export const StaticLabel = ({ label, value, className = "" }) => {
  return (
    <div className={`static-label ${className}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
};

export const Select = ({ label, value, onChange, options, className = "" }) => {
  return (
    <div className={`select-container ${className}`}>
      <label className="select-label">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="select-field"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};