import React, { useState } from 'react';
import { useSession, LogoutButton } from '@inrupt/solid-ui-react';

/**
 * Logout Component - Component that generates Logout section for users to a
 * Solid Pod via Solid Session
 *
 * @memberof Login
 * @name Logout
 */

const Logout = () => {
  const { session } = useSession();
  const [showConfirmation, setShowConfirmation] = useState(false);
  localStorage.setItem('loggedIn', true);

  // Event handler for logging out of PASS and removing items from localStorage
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('redirectUrl');
    localStorage.removeItem('restorePath');
    localStorage.removeItem('issuerConfig:https://opencommons.net');
  };

  return (
    <section id="logout" className="panel">
      <div className="row">
        <label id="labelLogout" htmlFor="btnLogout">
          Click the following logout button to log out of your pod:{' '}
        </label>
        <button type="submit" onClick={() => setShowConfirmation(true)}>
          Logout
        </button>
        {showConfirmation ? (
          <dialog open>
            <p>Do you want to log out now?</p>
            <div>
              <LogoutButton onLogout={handleLogout}>
                <button>Logout</button>
              </LogoutButton>
            </div>
            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
          </dialog>
        ) : (
          <div></div>
        )}
        <p className="labelStatus" role="alert">
          Your session is now logged in with the WebID [
          <a href={session.info.webId} target="_blank" rel="noreferrer">
            {session.info.webId}
          </a>
          ].
        </p>
      </div>
    </section>
  );
};

export default Logout;
