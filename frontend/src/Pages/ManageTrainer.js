import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const gradients = [
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #30cfd0, #330867)',
    'linear-gradient(135deg, #667eea, #764ba2)',
];

export default function ManageTrainers() {
    const [trainers, setTrainers] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editTrainer, setEditTrainer] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/auth/all-trainers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrainers(res.data);
        } catch (err) {
            toast.error('Failed to fetch trainers');
        }
    };

    const handleEdit = (trainer) => {
        setEditId(trainer._id);
        setEditTrainer({ ...trainer, password: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditTrainer((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = { ...editTrainer };
            if (!payload.password) delete payload.password;

            await axios.put(`http://localhost:5000/api/auth/trainer/${editId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Trainer updated successfully');
            setEditId(null);
            setEditTrainer({});
            fetchTrainers();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleCancel = () => {
        setEditId(null);
        setEditTrainer({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure to delete this trainer?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/auth/trainer/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Trainer deleted');
            setTrainers((prev) => prev.filter((t) => t._id !== id));
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const filteredTrainers = trainers.filter(
        (t) =>
            t?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t?.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h4 className="text-center mb-4">🏋️ Manage Trainers</h4>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3">
                {/* Back Button */}
                <input
                    type="text"
                    className="form-control w-100 w-md-50 border border-dark fw-bold"
                    placeholder="Search by Name or Course 🔍"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
                
                {/* Search Input */}
                <button
                    type="button"
                    className="btn btn-outline-dark fw-bold"
                    onClick={() => navigate(-1)}
                    style={{ minWidth: '100px' }}
                >
                    ← Back
                </button>
            </div>


            <div className="row">
                {filteredTrainers.map((trainer, idx) => (
                    <div key={trainer._id} className="col-md-6 mb-4">
                        <div
                            className="card shadow p-3 text-white"
                            style={{
                                background: gradients[idx % gradients.length],
                                borderRadius: '16px',
                            }}
                        >
                            <div className="d-flex gap-3 align-items-start mb-3">
                                <img
                                    src={`http://localhost:5000/${trainer.profilePic.replace(/^\/?uploads\//, 'uploads/')}`}
                                    alt="Profile"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                />
                                <h5 className="mt-2">{trainer.name}</h5>
                            </div>

                            <div className="row">
                                {[
                                    { label: 'Email', field: 'email' },
                                    {
                                        label: 'Password',
                                        field: 'password',
                                        render: () =>
                                            editId === trainer._id ? (
                                                <input
                                                    type="password"
                                                    className="form-control form-control-sm mt-1"
                                                    name="password"
                                                    placeholder="New password"
                                                    value={editTrainer.password || ''}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                '••••••'
                                            ),
                                    },
                                    { label: 'Course', field: 'course' },
                                    { label: 'Salary', field: 'salary' },
                                    { label: 'Contact', field: 'contactNumber' },
                                    { label: 'Join Date', field: 'dateOfJoin', type: 'date' },
                                ].map(({ label, field, type, render }) => (
                                    <div key={field} className="col-sm-6 mb-2">
                                        <strong>{label}:</strong>{' '}
                                        {render ? (
                                            render()
                                        ) : editId === trainer._id ? (
                                            <input
                                                type={type || 'text'}
                                                className="form-control form-control-sm mt-1"
                                                name={field}
                                                value={editTrainer[field] || ''}
                                                onChange={handleChange}
                                            />
                                        ) : field === 'dateOfJoin' ? (
                                            trainer.dateOfJoin
                                                ? new Date(trainer.dateOfJoin).toLocaleDateString()
                                                : 'N/A'
                                        ) : (
                                            trainer[field] || 'N/A'
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="text-end mt-3">
                                {editId === trainer._id ? (
                                    <>
                                        <button className="btn btn-success btn-sm me-2" onClick={handleSave}>
                                            Save
                                        </button>
                                        <button className="btn btn-light btn-sm" onClick={handleCancel}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-outline-light btn-sm me-2"
                                            onClick={() => handleEdit(trainer)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(trainer._id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
