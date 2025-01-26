import './App.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Dashboard from './components/Dashboard'
import { TransactionsProvider, useTransactions } from './context/TransactionsContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AccountSummary from './components/AccountSummary'
import CustomPaginationActionsTable from './components/TransactionTable'
import SideBar from './components/SideBar'
import Nav from './components/nav/Nav'
import { useContext } from 'react'

const theme = createTheme({
  palette: {
    primary: {
      main: '#dc2626',
    },
    background: {
      default: '#f3f4f6',
    },
  },
})

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationsProvider>
          <TransactionsProvider>
            <Nav />
            <main>
              <SideBar />
              <div className="container">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/account-summary" element={<AccountSummary />} />
                  <Route path="/transactions" element={<CustomPaginationActionsTable />} />
                </Routes>
              </div>
            </main>
          </TransactionsProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App