import * as React from 'react';
import './styles.css';

import { API_URL } from '../../constants';
import Logo from '../../images/Logo.png';

export default function LoginConfirmation() {
  return <div className="login-confirmation">
    <img
      alt="Backstroke"
      className="login-confirmation-logo"
      src={Logo}
    />

    <span className="login-confirmation-description">Logging in, please wait...</span>
    <span className="login-confirmation-detail">
      If you are not redirected, <a href={`${API_URL}/setup/login`}>click here</a>.
    </span>
  </div>;
}
