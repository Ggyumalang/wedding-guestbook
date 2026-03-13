
import { Routes, Route } from 'react-router-dom';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';
import { InputPage } from './pages/InputPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  // Supabase Realtime 구독 활성화 (weddingId가 있을 때만 동작)
  useSupabaseRealtime();

  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
