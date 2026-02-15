import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateGroupPage from './pages/CreateGroupPage';
import JoinGroupPage from './pages/JoinGroupPage';
import MyGroupsPage from './pages/MyGroupsPage';
import GroupDashboard from './pages/GroupDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateGroupPage />} />
        <Route path="/join" element={<JoinGroupPage />} />
        <Route path="/join/:groupCode" element={<JoinGroupPage />} />
        <Route path="/my-groups" element={<MyGroupsPage />} />
        <Route path="/group/:groupId" element={<GroupDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
