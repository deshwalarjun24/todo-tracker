import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  IconButton, ListItem, ListItemIcon, ListItemText, useMediaQuery, Switch, 
  Badge, Menu, MenuItem, Tooltip, Container } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Menu as MenuIcon, 
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  Repeat as RepeatIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  LocalFireDepartment as FireIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, isMobile }) => ({
    flexGrow: 1,
    padding: isMobile ? theme.spacing(2) : theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
    ...(open && !isMobile && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Layout = ({ children }) => {
  const theme = useTheme();
  const { state, dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmallMobile = useMediaQuery('(max-width:360px)');
  const location = useLocation();
  
  // Close drawer automatically when changing routes on mobile
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const unreadNotifications = state.notifications.filter(notification => !notification.read);
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  const handleThemeToggle = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleNotificationRead = (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };
  
  const handleClearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    handleNotificationsClose();
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Goals', icon: <CheckCircleIcon />, path: '/goals' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Habits', icon: <RepeatIcon />, path: '/habits' },
    { text: 'Streaks', icon: <FireIcon />, path: '/streaks' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open && !isMobile} elevation={0}>
        <Toolbar sx={{ minHeight: isMobile ? 56 : 64, px: isMobile ? 1 : 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ 
              mr: isMobile ? 1 : 2, 
              ...(open && !isMobile && { display: 'none' })
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant={isSmallMobile ? "subtitle1" : "h6"} 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: isExtraSmallMobile ? '0.9rem' : 'inherit'
            }}
          >
            {isExtraSmallMobile ? 'To-Do Tracker' : 'Personal To-Do Tracker'}
          </Typography>
          <Tooltip title={`Switch to ${state.theme === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton 
              color="inherit" 
              onClick={handleThemeToggle} 
              sx={{ mr: isMobile ? 0.5 : 1 }}
              size={isMobile ? "small" : "medium"}
            >
              {state.theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsOpen}
              size={isMobile ? "small" : "medium"}
            >
              <Badge badgeContent={unreadNotifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            PaperProps={{
              sx: {
                width: isMobile ? '90vw' : 320,
                maxWidth: 320,
                maxHeight: isMobile ? '80vh' : 400,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ 
              p: isMobile ? 1.5 : 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"}>Notifications</Typography>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer' }}
                onClick={handleClearNotifications}
              >
                Clear All
              </Typography>
            </Box>
            <Divider />
            
            {state.notifications.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2">No notifications</Typography>
              </MenuItem>
            ) : (
              state.notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={() => handleNotificationRead(notification.id)}
                  sx={{ 
                    backgroundColor: notification.read ? 'transparent' : 'rgba(76, 175, 80, 0.1)',
                    whiteSpace: 'normal'
                  }}
                >
                  <Box sx={{ py: 1 }}>
                    <Typography 
                      variant="body2" 
                      color={notification.type === 'success' ? 'success.main' : 'info.main'}
                      fontWeight={notification.read ? 400 : 600}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '85%' : drawerWidth,
            maxWidth: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
      >
        <DrawerHeader sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          px: 2
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Menu
          </Typography>
          <IconButton onClick={handleDrawerClose} edge="end">
            {isMobile ? <CloseIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerClose : undefined}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(76, 175, 80, 0.2)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' 
                      ? 'rgba(76, 175, 80, 0.2)' 
                      : 'rgba(76, 175, 80, 0.3)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 400 
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open} isMobile={isMobile}>
        <DrawerHeader />
        <Container 
          disableGutters 
          maxWidth="xl" 
          sx={{ 
            px: isMobile ? 1 : 2,
            overflow: 'hidden'
          }}
        >
          {children}
        </Container>
      </Main>
      <ToastContainer
        position={isMobile ? "bottom-center" : "bottom-right"}
        autoClose={isMobile ? 3000 : 5000}
        hideProgressBar={isMobile}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={state.theme}
        style={{ 
          width: isMobile ? '90%' : 'auto',
          fontSize: isMobile ? '14px' : '16px'
        }}
        toastStyle={{
          borderRadius: '8px',
          padding: isMobile ? '8px 12px' : '16px'
        }}
      />
    </Box>
  );
};

export default Layout;
