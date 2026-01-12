import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const [user, setUser] = useState(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [okEnabled, setOkEnabled] = useState(false);
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState({
    name: '', email: '', password: '', course: '', salary: '', contactNumber: ''
  });
  const [trainers, setTrainers] = useState([]);

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [student, setStudent] = useState({
    name: '', age: '', email: '', password: '', profilePic: '',
    course: '', parentName: '', parentOccupation: '', fee: '', coach: ''
  });
  const [studentProfileFile, setStudentProfileFile] = useState(null);
  const [studentPreview, setStudentPreview] = useState(null);
  const [studentDocs, setStudentDocs] = useState([]);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        toast.error('Failed to fetch Super Admin details');
      }
    };

    const fetchTrainers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/trainers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrainers(res.data);
      } catch (err) {
        toast.error('Failed to load trainers');
      }
    };

    fetchAdmin();
    fetchTrainers();
  }, []);
  const handleClick = () => {
    setShowModal(true);
    setSecondsLeft(10);
    setOkEnabled(false);
  };
  useEffect(() => {
    if (showModal && secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    } else if (secondsLeft === 0) {
      setOkEnabled(true);
    }
  }, [showModal, secondsLeft]);

  const handleOk = () => {
    navigate('/register-superadmin', { state: { allowed: true } });
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "/login"; // redirect to login or landing
    }, 1000);
  };

  const handleTrainerChange = e => setTrainer({ ...trainer, [e.target.name]: e.target.value });
  const handleTrainerFile = e => {
    const file = e.target.files[0];
    setProfilePicFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleTrainerSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(trainer).forEach(([k, v]) => formData.append(k, v));
      if (profilePicFile) formData.append('profilePic', profilePicFile);

      await axios.post('http://localhost:5000/api/auth/register-trainer', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      toast.success('Trainer registered successfully!');
      setShowTrainerModal(false);
      setTrainer({ name: '', email: '', password: '', course: '', salary: '', contactNumber: '' });
      setProfilePicFile(null);
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trainer registration failed');
    }
  };

  const handleStudentChange = e => setStudent({ ...student, [e.target.name]: e.target.value });
  const handleStudentProfile = e => {
    const file = e.target.files[0];
    setStudentProfileFile(file);
    setStudentPreview(URL.createObjectURL(file));
  };
  const handleStudentDocs = e => {
    const files = Array.from(e.target.files);
    if (files.length < 2 || files.length > 5) {
      toast.error('Upload 2 to 5 documents');
      return;
    }
    setStudentDocs(files);
  };
  const handleStudentSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(student).forEach(([k, v]) => formData.append(k, v));
      if (studentProfileFile) formData.append('profilePic', studentProfileFile);
      studentDocs.forEach(doc => formData.append('documents', doc));

      await axios.post('http://localhost:5000/api/auth/register-student', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      toast.success('Student registered successfully!');
      setShowStudentModal(false);
      setStudent({ name: '', age: '', email: '', password: '', profilePic: '', course: '', parentName: '', mobile: '', alternateMobile: '', dateOfJoin: '', parentOccupation: '', fee: '', coach: '' });
      setStudentDocs([]); setStudentProfileFile(null); setStudentPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Student registration failed');
    }
  };

  if (!user) return <div className="text-center mt-5">Loading Super Admin Info...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mb-4 p-3 animated-gradient-card text-white">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">

          {/* Profile Info */}
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
            <img
              src={
                user.profilePic?.startsWith('/uploads/')
                  ? `http://localhost:5000${user.profilePic}`
                  : `http://localhost:5000/uploads/${user.profilePic}`
              }
              alt="Profile"
              className="profile-img"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div className="profile-header-text text-center text-sm-start">
              <h5 className="mb-1 fw-bold">Name: {user.name}</h5>
              <p className="mb-0">Email: {user.email}</p>
              <p className="mb-0">🔐 {user.role}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-2 profile-actions">
            <button
              className="btn btn-outline-light fw-bold custom-outline-hover"
              onClick={handleClick}

            >
              ➕ Add Super Admin
            </button>
            <button
              className="btn btn-outline-light fw-bold custom-outline-hover"
              onClick={handleLogout}
            >
              🔓 Logout
            </button>
          </div>
        </div>
      </div>



      <div
        className="card text-white mb-4"
        style={{
          border: 'none',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div className="row row-cols-1 row-cols-sm-2 g-4">
          {/* Card Template */}
          {[
            {
              title: "Trainer Section",
              gradient: "linear-gradient(135deg, #1f4037, #99f2c8)",
              action: () => setShowTrainerModal(true),
              button: "➕ Add Trainer",
            },
            {
              title: "Student Section",
              gradient: "linear-gradient(135deg, #396afc, #41f7b0)",
              action: () => setShowStudentModal(true),
              button: "➕ Add Student",
            },
            {
              title: "Manage Trainer",
              gradient: "linear-gradient(135deg, #667eea, #764ba2)",
              action: () => navigate('/manage-trainer'),
              button: "⚙️ Go to Trainer Panel",
            },
            {
              title: "Manage Student",
              gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
              action: () => navigate('/manage-student'),
              button: "🎓 Go to Student Panel",
            },
          ].map((card, index) => (
            <div className="col" key={index}>
              <div
                className="card text-white text-center shadow h-100"
                style={{
                  background: card.gradient,
                  borderRadius: '15px',
                  padding: '1.5rem',
                }}
              >
                <h5 className="mb-3 fs-5 fs-sm-4 fs-md-3">{card.title}</h5>
                <button
                  className="btn btn-light fw-bold px-3 py-2"
                  onClick={card.action}
                  style={{ fontSize: '0.9rem' }}
                >
                  {card.button}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">⚠️ Confirm Super Admin Access</h5>
              </div>
              <div className="modal-body small">
                <p>
                  <strong>Warning:</strong> Super Admin has entire control of this application. You will be
                  responsible for <strong>all data, loss of data, and misuse</strong>. Make sure you trust the person
                  you're assigning this role to.
                </p>
                <p className="text-danger">Please wait <strong>{secondsLeft}</strong> seconds before proceeding.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  disabled={!okEnabled}
                  onClick={handleOk}
                >
                  OK
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trainer Modal */}
      {showTrainerModal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="card text-white p-4 shadow"
            style={{
              width: '100%',
              maxWidth: '500px',
              background: 'linear-gradient(135deg, #11998e, #38ef7d)',
              animation: 'fadeInScale 0.4s ease'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Register New Trainer</h5>
              <button className="btn-close bg-light" onClick={() => setShowTrainerModal(false)} />
            </div>
            <form onSubmit={handleTrainerSubmit}>
              <input className="form-control mb-2" name="name" placeholder="Name" value={trainer.name} onChange={handleTrainerChange} required />
              <input className="form-control mb-2" name="email" placeholder="Email" value={trainer.email} onChange={handleTrainerChange} required />
              <input className="form-control mb-2" name="password" type="password" placeholder="Password" value={trainer.password} onChange={handleTrainerChange} required />
              <input type="file" className="form-control mb-2" accept="image/*" onChange={handleTrainerFile} />
              {preview && <img src={preview} alt="Preview" className="mb-2" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />}
              <select className="form-control mb-2" name="course" value={trainer.course} onChange={handleTrainerChange} required>
                <option value="">Select Course</option>
                <option value="kickboxing">Kickboxing</option>
                <option value="yoga">Yoga</option>
                <option value="chess">Chess</option>
                <option value="carrom">Carrom</option>
                <option value="weight management">Weight Management</option>
                <option value="zumba">Zumba</option>
                <option value="dance">Dance</option>
              </select>
              <input className="form-control mb-2" name="salary" placeholder="Salary" value={trainer.salary} onChange={handleTrainerChange} />
              <input className="form-control mb-2" name="contactNumber" placeholder="Contact Number" value={trainer.contactNumber} onChange={handleTrainerChange} />
              <input
                name="dateOfJoin"
                type="date"
                className="form-control"
                value={trainer.dateOfJoin}
                onChange={handleTrainerChange}
              />
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-light" onClick={() => setShowTrainerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-dark">Register Trainer</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Student Modal */}
      {showStudentModal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
 
          }}
        >
          <div
            className="card text-white p-4 shadow animated-popup"
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'linear-gradient(135deg, #396afc,rgba(41, 255, 120, 0.55))', // blue gradient
              transition:"1s ",
              animation: 'fadeInScale 0.4s ease'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Register New Student</h5>
              <button className="btn-close bg-light" onClick={() => setShowStudentModal(false)} />
            </div>
            <form onSubmit={handleStudentSubmit}>
              <div className="row">
                {/* Name & Age */}
                <div className="col-md-6 mb-2">
                  <input name="name" className="form-control" placeholder="Name" onChange={handleStudentChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <input name="age" type="number" className="form-control" placeholder="Age" onChange={handleStudentChange} required />
                </div>

                {/* Email & Password */}
                <div className="col-md-6 mb-2">
                  <input name="email" className="form-control" placeholder="Email" onChange={handleStudentChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <input name="password" type="password" className="form-control" placeholder="Password" onChange={handleStudentChange} required />
                </div>

                {/* Profile Picture Upload & Preview */}
                <div className="col-md-6 mb-2">
                  <input type="file" accept="image/*" className="form-control" onChange={handleStudentProfile} />
                </div>
                <div className="col-md-6 mb-2">
                  {studentPreview && (
                    <img
                      src={studentPreview}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
                      alt="Preview"
                    />
                  )}
                </div>

                {/* Course & Coach */}
                <div className="col-md-6 mb-2">
                  <select name="course" className="form-control" onChange={handleStudentChange} required>
                    <option value="">Select Course</option>
                    {['kickboxing', 'yoga', 'chess', 'carrom', 'weight management', 'zumba', 'dance'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-2">
                  <select name="coach" className="form-control" onChange={handleStudentChange} required>
                    <option value="">Select Coach</option>
                    {trainers.map(t => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Parent Name & Occupation */}
                <div className="col-md-6 mb-2">
                  <input name="parentName" className="form-control" placeholder="Parent Name" onChange={handleStudentChange} />
                </div>
                <div className="col-md-6 mb-2">
                  <input name="parentOccupation" className="form-control" placeholder="Parent Occupation" onChange={handleStudentChange} />
                </div>

                {/* Fee */}
                <div className="col-md-6 mb-2">
                  <input name="fee" className="form-control" placeholder="Fee" onChange={handleStudentChange} />
                </div>

                {/* Mobile Numbers & Date */}
                <div className="col-md-6 mb-2">
                  <input type="text" name="mobile" className="form-control" placeholder="Mobile Number 1" onChange={handleStudentChange} />
                </div>
                <div className="col-md-6 mb-2">
                  <input type="text" name="alternateMobile" className="form-control" placeholder="Mobile Number 2" onChange={handleStudentChange} />
                </div>
                <div className="col-md-6 mb-2">
                  <input type="date" name="dateOfJoin" className="form-control" onChange={handleStudentChange} />
                </div>

                {/* Document Upload */}
                <div className="col-12 mb-2">
                  <label>Upload Documents (2–5)</label>
                  <input type="file" multiple accept="image/*" className="form-control" onChange={handleStudentDocs} />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3 gap-2">
                <button type="button" className="btn btn-light" onClick={() => setShowStudentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-dark">Register Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
