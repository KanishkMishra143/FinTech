import React from 'react';
import Homepage from './Homepage';

const LandingPage = ({ setShowSignUp, setShowSignIn }) => (
  <div>
    <Homepage setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} />
  </div>
);

export default LandingPage;
