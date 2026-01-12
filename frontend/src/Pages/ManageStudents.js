import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const gradients = [
  'linear-gradient(135deg, #ff9a9e, #fad0c4)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #f6d365, #fda085)',
  'linear-gradient(135deg, #84fab0, #8fd3f4)',
  'linear-gradient(135deg, #cfd9df, #e2ebf0)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
];

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editStudent, setEditStudent] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/all-students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      toast.error('Failed to fetch students');
    }
  };

  const handleEdit = (student) => {
    setEditId(student._id);
    setEditStudent({ ...student, password: '' }); // Include password for edit
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...editStudent };
      if (!payload.password) delete payload.password;

      await axios.put(`http://localhost:5000/api/auth/student/${editId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Student updated successfully');
      setEditId(null);
      setEditStudent({});
      fetchStudents();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setEditStudent({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this student?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/auth/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Student deleted');
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handlePrintProfile = (student) => {
    const printWindow = window.open('', '_blank');

    const documentsHTML = Array.isArray(student.documents)
      ? student.documents.map((doc, i) =>
        `<div>
            <p>Document ${i + 1}:</p>
            ${doc.endsWith('.pdf')
          ? `<a href="http://localhost:5000/uploads/${doc}" target="_blank">${doc}</a>`
          : `<img src="http://localhost:5000/uploads/${doc}" style="max-width:100%;height:auto;margin-bottom:10px;" />`}
          </div>`
      ).join('')
      : '<p>No documents found.</p>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Profile - ${student.name}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; }
            .image { margin: 10px 0; }
          </style>
        </head>
        <body>
          <h2>Student Details</h2>
           <h3>Profile Image:</h3>
          <img class="image" src="http://localhost:5000/uploads/${student.profilePic}" style="max-width:200px;height:auto;" />
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Age:</strong> ${student.age}</p>
          <p><strong>Course:</strong> ${student.course}</p>
          <p><strong>Fee:</strong> ${student.fee}</p>
          <p><strong>Parent Name:</strong> ${student.parentName}</p>
          <p><strong>Occupation:</strong> ${student.parentOccupation}</p>
          <p><strong>Coach:</strong> ${student.coach}</p>
          <p><strong>Mobile:</strong> ${student.mobile}</p>
          <p><strong>Alt Mobile:</strong> ${student.alternateMobile}</p>
          <p><strong>Join Date:</strong> ${new Date(student.dateOfJoin).toLocaleDateString()}</p>

          

          <h3>Documents:</h3>
          ${documentsHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||

                String(s.mobile).toLowerCase().includes(searchTerm.toLowerCase()) ||

  String(s.fee).toLowerCase().includes(searchTerm.toLowerCase())

  );

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">🎓 Manage Students</h4>

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
        {filteredStudents.map((student, idx) => (
          <div key={student._id} className="col-md-6 mb-4">
            <div
              className="card shadow p-3 text-white"
              style={{
                background: gradients[idx % gradients.length],
                borderRadius: '16px',
              }}
            >
              <div className="d-flex gap-3 align-items-start mb-3">
                <img
                  src={`http://localhost:5000/uploads/${student.profilePic}`}
                  alt="Profile"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <h5 className="mt-2">{student.name}</h5>
              </div>

              <div className="row">
                {[
                  { label: 'Email', field: 'email' },
                  { label: 'Password', field: 'password', isPassword: true },
                  { label: 'Age', field: 'age' },
                  { label: 'Course', field: 'course' },
                  { label: 'Fee', field: 'fee' },
                  { label: 'Parent Name', field: 'parentName' },
                  { label: 'Occupation', field: 'parentOccupation' },
                  { label: 'Coach', field: 'coach' },
                  { label: 'Mobile', field: 'mobile' },
                  { label: 'Alt Mobile', field: 'alternateMobile' },
                  { label: 'Join Date', field: 'dateOfJoin', type: 'date' },
                ].map(({ label, field, type, isPassword }) => (
                  <div key={field} className="col-sm-6 mb-2">
                    <strong>{label}:</strong>{' '}
                    {editId === student._id ? (
                      <input
                        type={isPassword ? 'password' : type || 'text'}
                        className="form-control form-control-sm mt-1"
                        name={field}
                        value={editStudent[field] || ''}
                        placeholder={isPassword ? 'New password' : ''}
                        onChange={handleChange}
                      />
                    ) : field === 'dateOfJoin' ? (
                      student.dateOfJoin ? new Date(student.dateOfJoin).toLocaleDateString() : 'N/A'
                    ) : isPassword ? (
                      '••••••'
                    ) : (
                      student[field] || 'N/A'
                    )}
                  </div>
                ))}
              </div>

              <div className="text-end mt-3">
                <button
                  className="btn btn-sm text-white me-2"
                  style={{
                    background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '6px 16px',
                    fontWeight: '500',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                  }}
                  onClick={() => handlePrintProfile(student)}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = 0.85)}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
                >
                  🖨️ Print Profile
                </button>

                {editId === student._id ? (
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
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(student._id)}
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
