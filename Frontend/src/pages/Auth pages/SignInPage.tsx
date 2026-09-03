import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../../context/AuthContext';

const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let role: Role = null;

    // Dummy email to role mapping
    if (email === 'employee@test.com') role = 'employee';
    else if (email === 'agent@test.com') role = 'agent';
    else if (email === 'lead@test.com') role = 'department lead';
    else if (email === 'admin@test.com') role = 'system admin';
    else if (email === 'platform@test.com') role = 'platform admin';
    
    if (!role) {
      setError('Invalid email or password. Try one of the test accounts below.');
      return;
    }

    // Create dummy user data based on role
    const dummyUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Test ${role}`,
      role: role,
    };

    login(dummyUser);

    // Redirect to the appropriate home page based on role
    switch (role) {
      case 'employee':
        navigate('/employee');
        break;
      case 'agent':
        navigate('/agent');
        break;
      case 'department lead':
        navigate('/department-lead');
        break;
      case 'system admin':
        navigate('/system-admin');
        break;
      case 'platform admin':
        navigate('/platform-admin');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
            placeholder="enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
            placeholder="enter your password"
          />
        </div>
        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Sign In
        </button>
      </form>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#555', textAlign: 'center' }}>
        <p><strong>Dummy Accounts:</strong></p>
        <p>employee@test.com</p>
        <p>agent@test.com</p>
        <p>lead@test.com</p>
        <p>admin@test.com</p>
        <p>platform@test.com</p>
      </div>
    </div>
  );
};

export default SignInPage;
