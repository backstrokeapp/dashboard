import * as React from 'react';
import { API_URL } from '../../constants';
import './styles.css';

export default function LinkError({error}) {
  return <div className="link-error-container">
    <div className="link-error">
      {error}

      {/* Add link to login page if the error has to do with that. */}
      {error && error.indexOf('authenticated') >= 0 ? <a href={`${API_URL}/setup/login`}>Login</a> : null}
    </div>
  </div>;
}
