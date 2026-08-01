import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/app-layout/app-layout';
import { Admin } from './pages/admin/admin';
import { Booking } from './pages/booking/booking';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/bookings/new" replace />} />
        <Route path="/bookings/new" element={<Booking />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
