import React from 'react';

export default ({children, description}) => (
  <div className="field">        
    <label className="label">{description}
      {children}
    </label>
  </div>
);