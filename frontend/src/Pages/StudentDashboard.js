import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function StudentDashboard() {
    const [student, setStudent] = useState(null);

    const fetchStudent = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudent(res.data);
        } catch (err) {
            toast.error('Session expired or unauthorized');
            localStorage.removeItem('token');
            setTimeout(() => (window.location.href = '/'), 1500);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/';
        } else {
            fetchStudent();
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully!');
        setTimeout(() => (window.location.href = '/login'), 500);
    };

    const handleDelete = async (url) => {
        const confirm = window.confirm('Are you sure you want to delete this video?');
        if (!confirm) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/auth/delete-video', {
                headers: { Authorization: `Bearer ${token}` },
                data: { url },
            });
            toast.success('Video deleted!');
            fetchStudent();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    if (!student) return <div className="text-center mt-5">Loading Student Info...</div>;

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="card shadow p-4 mb-4 d-flex flex-md-row flex-column align-items-center justify-content-between fade-in"
                style={{ background: 'linear-gradient(to right, #ffecd2, #fcb69f)' }}>
                <div className="d-flex align-items-center gap-3">
                    <img
                        src={
                            student.profilePic
                                ? `http://localhost:5000/uploads/${student.profilePic}`
                                : 'https://via.placeholder.com/80'
                        }
                        alt="Student Profile"
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #fff',
                        }}
                    />
                    <div>
                        <h5 className="mb-1 text-dark fs-6 fs-sm-6">{student.name}</h5>
                        <p className="mb-0 text-dark small"><strong>📧</strong> {student.email}</p>
                        <p className="mb-0 text-dark small"><strong>🎓</strong> {student.course}</p>
                    </div>
                </div>
                <button className="btn btn-danger mt-3 mt-md-0" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </div>

            {/* Details */}
            <div className="card shadow-sm p-3 mb-4 fade-in">
                <div className="row">
                    <div className="col-md-4"><strong>Age:</strong> {student.age}</div>
                    <div className="col-md-4"><strong>Coach:</strong> {student.coach}</div>
                    <div className="col-md-4"><strong>Mobile:</strong> {student.mobile}</div>
                    <div className="col-md-4"><strong>Mobile:</strong> {student.alternateMobile}</div>
                    <div className="col-md-4">
                        <strong>Date of Join:</strong>{' '}
                        {student.dateOfJoin
                            ? new Date(student.dateOfJoin).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            })
                            : 'N/A'}
                    </div>



                    <div className="col-md-4"><strong>Parent:</strong> {student.parentName} ({student.parentOccupation})</div>

                    <div className="col-md-4 mt-2"><strong>Fee Paid:</strong> ₹{student.fee}</div>
                </div>
            </div>

            {/* Videos */}
            <h5 className="mb-3">🎥 Training Videos</h5>
            <div className="row fade-in g-1">
                {student.videos?.length > 0 ? (
                    student.videos.map((vid, i) => (
                        <div key={i} className="col-6 col-sm-4 col-lg-3 mb-2">
                            <div className="card shadow-sm h-100 p-1">
                                <div className="card-body p-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="mb-0 text-truncate" style={{ fontSize: '0.75rem' }}>
                                            {vid.title}
                                        </h6>
                                        <button
                                            className="btn btn-sm btn-outline-danger py-0 px-2"
                                            style={{ fontSize: '0.7rem' }}
                                            onClick={() => handleDelete(vid.url)}
                                        >
                                            🗑
                                        </button>
                                    </div>
                                    <video
                                        controls
                                        controlsList="nodownload"
                                        className="w-100 rounded"
                                        style={{ maxHeight: '140px', objectFit: 'cover' }}
                                    >
                                        <source src={`http://localhost:5000${vid.url}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted small">No videos uploaded yet.</div>
                )}
            </div>


            {/* CSS animation */}
           <style>{`
  .fade-in {
    animation: fadeIn 0.6s ease-in-out both;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 400px) {
    h5, h6, p, strong, .btn, .card-body {
      font-size: 0.75rem !important;
    }
    .btn {
      padding: 2px 6px !important;
    }
    video {
      max-height: 120px !important;
    }
  }
`}</style>

        </div>
    );
}
