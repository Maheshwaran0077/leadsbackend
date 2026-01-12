import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../App.css'; // Ensure this import is here

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      toast.success(`Logged in as ${user.role}`);

      if (user.role === 'superAdmin') navigate('/superadmin-dashboard');
      else if (user.role === 'trainer') navigate('/trainer-dashboard');
      else if (user.role === 'student') navigate('/student-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '100%', maxWidth: 400 }}>
        <h3 className="text-center text-gradient mb-4 d-flex justify-content-center align-items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          Lead's Management
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            className="form-control mb-4"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button className="btn btn-primary w-100 mb-3">Login</button>
        </form>
        <div className="text-center text-muted small">
          &copy; {new Date().getFullYear()} Lead&apos;s Management
        </div>
      </div>
    </div>
  );
}
