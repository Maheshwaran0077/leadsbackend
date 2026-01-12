import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SuperAdminRegister from './Pages/SuperAdminRegister';
import Login from './Pages/Login';
import SuperAdminDashboard from './Pages/SuperAdminDashboard';
import StudentDashboard from './Pages/StudentDashboard';
import TrainerDashboard from './Pages/TrainerDashboard ';
import ProtectedRoute from './Pages/ProtectedRoute';
import ManageTrainers from './Pages/ManageTrainer';
import ManageStudents from './Pages/ManageStudents';

const NotFound = () => <h1>404 - Page Not Found</h1>;

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
         <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register-superadmin" element={<SuperAdminRegister />} />

          <Route
            path="/superadmin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-trainer"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <ManageTrainers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-student"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
     </BrowserRouter>
  );
}
