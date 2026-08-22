import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/bookappointment";
import MyAppointments from "./pages/MyAppointments";
import AdminAppointments from "./pages/AdminAppointments";
import AdminDoctors from "./pages/AdminDoctors";
import AdminPatients from "./pages/AdminPatients";
import PatientAppointments from "./pages/PatientAppointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import CreatePrescription from "./pages/CreatePrescription";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import AppointmentHistory from "./pages/AppointmentHistory";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function Home() {
  return <h1>Healthcare Manager</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
  path="/admin/appointments"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminAppointments />
    </ProtectedRoute>
  }
/>
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
<Route
  path="/patient/appointment-history"
  element={<AppointmentHistory />}
/>
<Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="PATIENT">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/doctor"
  element={<DoctorDashboard />}
/>
<Route
  path="/patient/prescriptions"
  element={<PatientPrescriptions />}
/>
<Route
  path="/doctor/prescription/:appointmentId"
  element={<CreatePrescription />}
/>
        <Route
  path="/admin/patients/:patientId/appointments"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <PatientAppointments />
    </ProtectedRoute>
  }
/>
              <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDoctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPatients />
            </ProtectedRoute>
          }
        />
        <Route
  path="/book-appointment"
  element={
    <ProtectedRoute>
      <BookAppointment />
    </ProtectedRoute>
  }
/>
        <Route
  path="/doctors"
  element={
    <ProtectedRoute allowedRole="PATIENT">
      <Doctors />
    </ProtectedRoute>
  }
/>
      <Route
  path="/my-appointments"
  element={
    <ProtectedRoute allowedRole="PATIENT">
      <MyAppointments />
    </ProtectedRoute>
  }
/>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;