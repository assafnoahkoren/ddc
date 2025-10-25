import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Register</h1>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
      <p>
        <Link to="/">Go to Home</Link>
      </p>
    </div>
  );
}
