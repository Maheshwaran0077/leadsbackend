import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SuperAdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [profilePic, setProfilePic] = useState(null); // File input
  const [preview, setPreview] = useState(null); // For showing preview on UI

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }

      await axios.post('http://localhost:5000/api/auth/register-superadmin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Super Admin registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4 text-center">Super Admin Registration</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow">
        <input type="text" className="form-control mb-3" name="name" placeholder="Name" onChange={handleChange} />
        <input type="email" className="form-control mb-3" name="email" placeholder="Email" onChange={handleChange} />
        <input type="file" className="form-control mb-3" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Preview" className="mb-3" style={{ height: '100px', borderRadius: '8px' }} />}
        <input type="password" className="form-control mb-3" name="password" placeholder="Password" onChange={handleChange} />
        <button className="btn btn-success w-100">Register</button>
      </form>
    </div>
  );
}
