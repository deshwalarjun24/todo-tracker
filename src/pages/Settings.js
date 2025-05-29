import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Add as AddIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  LocalOffer as TagIcon,
  DeleteSweep as ClearIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const { state, dispatch } = useAppContext();
  const [newTag, setNewTag] = useState('');
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [clearOption, setClearOption] = useState('');
  
  const handleThemeToggle = () => {
    dispatch({ type: 'TOGGLE_THEME' });
    toast.info(`Theme switched to ${state.theme === 'light' ? 'dark' : 'light'} mode`);
  };
  
  const handleAddTag = () => {
    if (newTag && !state.tags.includes(newTag)) {
      dispatch({ type: 'ADD_TAG', payload: newTag });
      setNewTag('');
      toast.success(`Tag "${newTag}" added successfully`);
    } else if (state.tags.includes(newTag)) {
      toast.error('This tag already exists');
    }
  };
  
  const handleDeleteTag = (tag) => {
    dispatch({ type: 'REMOVE_TAG', payload: tag });
    toast.info(`Tag "${tag}" removed`);
  };
  
  const handleOpenClearDialog = (option) => {
    setClearOption(option);
    setOpenClearDialog(true);
  };
  
  const handleCloseClearDialog = () => {
    setOpenClearDialog(false);
  };
  
  const handleClearData = () => {
    // Implement data clearing based on selected option
    switch (clearOption) {
      case 'completed':
        dispatch({ type: 'CLEAR_COMPLETED_GOALS' });
        toast.success('Completed goals cleared successfully');
        break;
      case 'all-goals':
        dispatch({ type: 'CLEAR_ALL_GOALS' });
        toast.success('All goals cleared successfully');
        break;
      case 'habits':
        dispatch({ type: 'CLEAR_ALL_HABITS' });
        toast.success('All habits cleared successfully');
        break;
      case 'everything':
        localStorage.removeItem('todoTrackerState');
        window.location.reload();
        break;
      default:
        break;
    }
    
    handleCloseClearDialog();
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={state.theme === 'dark'}
                    onChange={handleThemeToggle}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {state.theme === 'dark' ? (
                      <>
                        <DarkModeIcon sx={{ mr: 1 }} />
                        <Typography>Dark Mode</Typography>
                      </>
                    ) : (
                      <>
                        <LightModeIcon sx={{ mr: 1 }} />
                        <Typography>Light Mode</Typography>
                      </>
                    )}
                  </Box>
                }
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Choose between light and dark theme for your to-do tracker.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={true}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 1 }} />
                    <Typography>Enable Notifications</Typography>
                  </Box>
                }
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Receive notifications for reminders, completed goals, and motivational quotes.
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Browser notifications require permission. You may need to enable them in your browser settings.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tags Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manage Tags
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', mb: 3 }}>
                <TextField
                  size="small"
                  label="New Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddTag}
                  disabled={!newTag || state.tags.includes(newTag)}
                >
                  Add
                </Button>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Available Tags
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {state.tags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    icon={<TagIcon />}
                    onDelete={() => handleDeleteTag(tag)}
                  />
                ))}
              </Box>
              
              {state.tags.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No tags available. Add some tags to organize your goals.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Clear Completed Goals" 
                    secondary="Remove all completed goals from your list"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      color="warning"
                      onClick={() => handleOpenClearDialog('completed')}
                    >
                      Clear
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Clear All Goals" 
                    secondary="Remove all goals (completed and incomplete)"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      color="warning"
                      onClick={() => handleOpenClearDialog('all-goals')}
                    >
                      Clear
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Clear All Habits" 
                    secondary="Remove all habits and their tracking history"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      color="warning"
                      onClick={() => handleOpenClearDialog('habits')}
                    >
                      Clear
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Reset Everything" 
                    secondary="Clear all data and reset the application to default"
                    primaryTypographyProps={{ color: 'error' }}
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="contained" 
                      color="error"
                      startIcon={<ClearIcon />}
                      onClick={() => handleOpenClearDialog('everything')}
                    >
                      Reset
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* About Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" paragraph>
                Personal To-Do Tracker is a comprehensive task management application designed to help you organize your goals, build habits, and boost productivity.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Version 1.0.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Clear Data Confirmation Dialog */}
      <Dialog
        open={openClearDialog}
        onClose={handleCloseClearDialog}
      >
        <DialogTitle>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {clearOption === 'completed' && "Are you sure you want to clear all completed goals? This action cannot be undone."}
            {clearOption === 'all-goals' && "Are you sure you want to clear ALL goals? This action cannot be undone."}
            {clearOption === 'habits' && "Are you sure you want to clear all habits and their history? This action cannot be undone."}
            {clearOption === 'everything' && "Are you sure you want to reset EVERYTHING? All your data will be permanently deleted. This action cannot be undone."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClearDialog}>Cancel</Button>
          <Button onClick={handleClearData} color="error" variant="contained">
            {clearOption === 'everything' ? 'Reset Everything' : 'Clear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
