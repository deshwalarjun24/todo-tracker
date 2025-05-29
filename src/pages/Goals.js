import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tooltip,
  FormHelperText,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Autocomplete,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import moment from 'moment';
import { toast } from 'react-toastify';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Goals = () => {
  const { state, dispatch } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [newTag, setNewTag] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: moment().format('YYYY-MM-DD'),
    timeframe: 'daily',
    priority: 'medium',
    tags: []
  });
  
  // Tabs mapping
  const tabs = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ];
  
  useEffect(() => {
    filterGoals();
  }, [state.goals, currentTab]);
  
  const filterGoals = () => {
    const timeframe = tabs[currentTab].value;
    
    let filtered = state.goals.filter(goal => goal.timeframe === timeframe);
    
    // Sort by deadline (ascending), then by priority (high to low)
    filtered.sort((a, b) => {
      // First sort by deadline
      const deadlineDiff = moment(a.deadline).diff(moment(b.deadline));
      if (deadlineDiff !== 0) return deadlineDiff;
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setFilteredGoals(filtered);
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleOpenDialog = (goal = null) => {
    if (goal) {
      // Edit existing goal
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        deadline: moment(goal.deadline).format('YYYY-MM-DD'),
        timeframe: goal.timeframe,
        priority: goal.priority,
        tags: goal.tags || []
      });
    } else {
      // Create new goal with default values
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        deadline: moment().format('YYYY-MM-DD'),
        timeframe: tabs[currentTab].value,
        priority: 'medium',
        tags: []
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleTagsChange = (event) => {
    const {
      target: { value },
    } = event;
    
    setFormData({
      ...formData,
      tags: typeof value === 'string' ? value.split(',') : value,
    });
  };
  
  const handleAddNewTag = () => {
    if (newTag && !state.tags.includes(newTag)) {
      dispatch({ type: 'ADD_TAG', payload: newTag });
      
      // Also add to current form if not already included
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
      }
      
      setNewTag('');
    }
  };
  
  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('Please enter a title for your goal');
      return;
    }
    
    if (editingGoal) {
      // Update existing goal
      dispatch({
        type: 'UPDATE_GOAL',
        payload: {
          ...editingGoal,
          ...formData
        }
      });
      toast.success('Goal updated successfully');
    } else {
      // Create new goal
      dispatch({
        type: 'ADD_GOAL',
        payload: formData
      });
      toast.success('Goal added successfully');
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteGoal = (goalId) => {
    dispatch({ type: 'DELETE_GOAL', payload: goalId });
    toast.info('Goal deleted');
  };
  
  const handleToggleGoalCompletion = (goalId) => {
    dispatch({ type: 'TOGGLE_GOAL_COMPLETION', payload: goalId });
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  };
  
  const isOverdue = (deadline) => {
    return moment(deadline).isBefore(moment(), 'day');
  };
  
  const groupGoalsByDeadline = () => {
    const groups = {};
    
    filteredGoals.forEach(goal => {
      const key = moment(goal.deadline).format('YYYY-MM-DD');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(goal);
    });
    
    return Object.keys(groups).sort((a, b) => moment(a).diff(moment(b))).map(date => ({
      date,
      goals: groups[date]
    }));
  };
  
  const groupedGoals = groupGoalsByDeadline();
  
  return (
    <Box sx={{ flexGrow: 1, px: isMobile ? 1 : 2 }}>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: isMobile ? 2 : 3, gap: isMobile ? 1 : 0 }}>
        <Typography variant="h4">Goals</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Goal
        </Button>
      </Box>
      
      <Paper sx={{ mb: isMobile ? 2 : 3, overflow: 'auto' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Paper>
      
      {filteredGoals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {tabs[currentTab].label.toLowerCase()} goals found
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Create Your First {tabs[currentTab].label} Goal
          </Button>
        </Paper>
      ) : (
        <Box>
          {groupedGoals.map(group => (
            <Box key={group.date} sx={{ mb: 4 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  backgroundColor: isOverdue(group.date) && !group.goals.every(g => g.completed) 
                    ? 'error.light' 
                    : moment(group.date).isSame(moment(), 'day')
                      ? 'primary.light'
                      : 'background.default',
                  px: 2,
                  py: 1,
                  borderRadius: 1
                }}
              >
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {moment(group.date).isSame(moment(), 'day') 
                    ? 'Today' 
                    : moment(group.date).isSame(moment().add(1, 'day'), 'day')
                      ? 'Tomorrow'
                      : moment(group.date).format('dddd, MMMM D, YYYY')}
                </Typography>
                {isOverdue(group.date) && !group.goals.every(g => g.completed) && (
                  <Chip 
                    label="Overdue" 
                    color="error" 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
              
              <Grid container spacing={2}>
                {group.goals.map(goal => (
                  <Grid item xs={12} sm={6} md={4} key={goal.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        opacity: goal.completed ? 0.8 : 1,
                        backgroundColor: goal.completed 
                          ? 'action.hover' 
                          : 'background.paper'
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          <Tooltip title={`Priority: ${goal.priority}`}>
                            <FlagIcon color={getPriorityColor(goal.priority)} />
                          </Tooltip>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                          >
                            {tabs.find(tab => tab.value === goal.timeframe)?.label}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 1,
                            textDecoration: goal.completed ? 'line-through' : 'none'
                          }}
                        >
                          {goal.title}
                        </Typography>
                        
                        {goal.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              textDecoration: goal.completed ? 'line-through' : 'none'
                            }}
                          >
                            {goal.description}
                          </Typography>
                        )}
                        
                        {goal.tags && goal.tags.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {goal.tags.map(tag => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                icon={<TagIcon />}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                      
                      <Divider />
                      
                      <CardActions>
                        <Tooltip title={goal.completed ? "Mark as incomplete" : "Mark as complete"}>
                          <IconButton 
                            color={goal.completed ? "success" : "default"}
                            onClick={() => handleToggleGoalCompletion(goal.id)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary"
                            onClick={() => handleOpenDialog(goal)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}
      
      {/* Add/Edit Goal Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingGoal ? 'Edit Goal' : 'Add New Goal'}
        </DialogTitle>
        
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Goal Title"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="deadline"
                name="deadline"
                label="Deadline"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.deadline}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-label"
                  id="timeframe"
                  name="timeframe"
                  value={formData.timeframe}
                  label="Timeframe"
                  onChange={handleInputChange}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={formData.priority}
              label="Priority"
              onChange={handleInputChange}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" sx={{ mb: 1 }}>
            <InputLabel id="tags-label">Tags</InputLabel>
            <Select
              labelId="tags-label"
              id="tags"
              name="tags"
              multiple
              value={formData.tags}
              onChange={handleTagsChange}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {state.tags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  <Checkbox checked={formData.tags.indexOf(tag) > -1} />
                  <ListItemText primary={tag} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', mt: 2, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 1 : 0 }}>
            <TextField
              size="small"
              label="Add New Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              sx={{ flexGrow: 1, mr: isMobile ? 0 : 1 }}
            />
            <Button 
              variant="outlined" 
              onClick={handleAddNewTag}
              disabled={!newTag || state.tags.includes(newTag)}
            >
              Add
            </Button>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 1 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingGoal ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Goals;
