import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function TrainerDashboard() {
    const [trainer, setTrainer] = useState(null);
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ email: '', title: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchTrainerAndStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTrainer(res.data);

                const studentRes = await axios.get('http://localhost:5000/api/auth/students-by-course', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(studentRes.data);
            } catch (err) {
                toast.error('Failed to load data');
            }
        };

        fetchTrainerAndStudents();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 100 * 1024 * 1024;
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only MP4, WebM, or OGG formats allowed");
            return;
        }
        if (file.size > maxSize) {
            toast.error("Max video size is 100MB");
            return;
        }
        setVideoFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.title || !videoFile) {
            toast.error("All fields are required!");
            return;
        }

        const formData = new FormData();
        formData.append('email', form.email);
        formData.append('title', form.title);
        formData.append('video', videoFile);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/upload-video', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            toast.success('Video uploaded successfully!');
            setShowModal(false);
            setForm({ email: '', title: '' });
            setVideoFile(null);
            setUploadProgress(0);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setUploadProgress(0);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success("Logged out successfully!");
        setTimeout(() => {
            window.location.href = "/login";
        }, 500);
    };

    if (!trainer) return <div className="text-center mt-5">Loading Trainer Info...</div>;

    return (
        <div className="container mt-5">
            {/* Trainer Info */}
            <div
                className="card shadow mb-4 p-4"
                style={{
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #fdfcfb, #e2d1c3)',
                }}
            >
                <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                    <img
                        src={`http://localhost:5000/${trainer.profilePic.replace(/^\/?uploads\//, 'uploads/')}`}

                        alt="Profile"
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid #fff',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        }}
                    />
                    <div className="container">
                        <div className="row text-center text-md-start">
                            <div className="col-md-4 mb-2">
                                <strong>Name:</strong><br /> {trainer.name}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong>Email:</strong><br /> {trainer.email}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong>Course:</strong><br /> {trainer.course}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong>Contact:</strong><br /> {trainer.contactNumber || 'N/A'}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong>Salary:</strong><br /> ₹{trainer.salary || 'N/A'}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong>Join Date:</strong><br />
                                {trainer.dateOfJoin ? new Date(trainer.dateOfJoin).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-end mt-4">
                    <button className="btn btn-danger fw-bold px-4" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>


            {/* Upload Video */}
            <div className="text-center mb-4">
                <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Upload Training Video</button>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 9999
                }}>
                    <div className="card p-4" style={{ width: '100%', maxWidth: '500px' }}>
                        <div className="d-flex justify-content-between mb-3">
                            <h5 className="mb-0">Upload Training Video</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <select name="email" className="form-control mb-2" value={form.email} onChange={handleChange} required>
                                <option value="">Select Student</option>
                                {students.map(s => (
                                    <option key={s._id} value={s.email}>{s.name} ({s.email})</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="title"
                                className="form-control mb-2"
                                placeholder="Video Title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                            <input type="file" accept="video/*" className="form-control mb-2" onChange={handleFile} required />
                            {uploadProgress > 0 && (
                                <div className="progress mb-2">
                                    <div className="progress-bar" role="progressbar" style={{ width: `${uploadProgress}%` }}>
                                        {uploadProgress}%
                                    </div>
                                </div>
                            )}
                            <div className="text-end">
                                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Student List */}
            <h4 className="mb-3">Students in {trainer.course}</h4>
            <div className="row">
                {students.length === 0 && <p>No students found.</p>}
                {students.map((student) => (
                    <div key={student._id} className="col-md-4">
                        <div className="card p-3 mb-3 shadow-sm">
                            <img
                                src={`http://localhost:5000/uploads/${student.profilePic}`}
                                alt="Student"
                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
                                className="mb-2 mx-auto"
                            />
                            <h5 className="text-center">{student.name}</h5>
                            <p><strong>Email:</strong> {student.email}</p>
                            <p><strong>Age:</strong> {student.age}</p>
                            <p><strong>Fee:</strong> ₹{student.fee}</p>
                            <p><strong>Contact:</strong> {student.mobile}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
