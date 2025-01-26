import { AppBar, Toolbar, Typography, Box } from '@mui/material';

function Header() {
  return (
    <AppBar position="static" className="bg-white shadow-sm mb-6">
      <Toolbar className="justify-between">
        <Typography variant="h5" className="text-gray-800 font-semibold">
          Expense Tracker
        </Typography>
        <Box className="flex items-center space-x-4">
          {/* Add any header actions here */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 