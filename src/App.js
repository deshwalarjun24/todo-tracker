import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppProvider, useAppContext } from './context/AppContext';
import { createAppTheme } from './styles/theme';

// Import pages
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Habits from './pages/Habits';
import Streaks from './pages/Streaks';
import Settings from './pages/Settings';

// Import components
import Layout from './components/common/Layout';

// Theme wrapper component
const ThemedApp = () => {
  const { state } = useAppContext();
  const theme = createAppTheme(state.theme);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/streaks" element={<Streaks />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

// Main App component wrapped with context provider
function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}

export default App;
