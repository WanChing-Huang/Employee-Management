import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect ,useState} from 'react';

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
} from '@mui/material';
import {
  AccountCircle,
  Home,
  People,
  Assignment,
  AssignmentInd,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { fetchMyProfile } from '../store/profileSlice';
import UserProfile from '../../../backend/src/models/UserProfile';




const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  //const profile = useSelector((state) => state.profile?.data);
  
  const [anchorEl, setAnchorEl] = React.useState(null);
 
  
  const isHR = user?.role === 'hr';
  //const userProfile =  dispatch(fetchMyProfile());;

  useEffect(() => {
  const loadProfile = async () => {
    try {
      const profile = await dispatch(fetchMyProfile()).unwrap();
      setProfile(profile); 
      console.log('✅ user profile:', profile);
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
    }
  };

  loadProfile();
}, [dispatch]);

  //console.log(profile);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const employeeNavItems = [
    { label: 'Personal Info', path: '/personal-info', icon: <AccountCircle /> },
    { label: 'Visa Status', path: '/visa-status', icon: <Assignment /> },
  ];

  const hrNavItems = [
    { label: 'Home', path: '/hr/dashboard', icon: <Home /> },
    { label: 'Employee Profiles', path: '/hr/employees', icon: <People /> },
    { label: 'Visa Management', path: '/hr/visa-management', icon: <Assignment /> },
    { label: 'Hiring Management', path: '/hr/hiring-management', icon: <AssignmentInd /> },
  ];

  const navItems = isHR ? hrNavItems : employeeNavItems;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar> 
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
            Employee Management
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {profile?.userProfile?.firstName || ''} {profile?.userProfile?.lastName ||""} ({isHR ? 'HR' : 'Employee'})
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}
                src={profile?.userProfile?.profilePicture ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${profile.userProfile.profilePicture}` : undefined}> 
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;