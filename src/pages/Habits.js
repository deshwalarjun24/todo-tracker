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
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  LinearProgress,
  FormHelperText,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Repeat as RepeatIcon,
  LocalFireDepartment as FireIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import moment from 'moment';
import { toast } from 'react-toastify';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

const Habits = () => {
  const { state, dispatch } = useAppContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const [habitStats, setHabitStats] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    color: '#4CAF50',
    reminder: false
  });
  
  useEffect(() => {
    calculateHabitStats();
  }, [state.habits, selectedMonth]);
  
  const calculateHabitStats = () => {
    const monthStart = moment(selectedMonth).startOf('month');
    const monthEnd = moment(selectedMonth).endOf('month');
    const daysInMonth = monthEnd.diff(monthStart, 'days') + 1;
    
    const stats = state.habits.map(habit => {
      // Calculate completion rate for the selected month
      const daysCompleted = habit.history.filter(entry => 
        moment(entry.date).isBetween(monthStart, monthEnd, null, '[]') && 
        entry.completed
      ).length;
      
      const completionRate = daysInMonth > 0 
        ? Math.round((daysCompleted / daysInMonth) * 100) 
        : 0;
      
      // Get current streak
      const streak = habit.streak;
      
      // Calculate longest streak
      let longestStreak = 0;
      let currentStreak = 0;
      
      // Sort history by date
      const sortedHistory = [...habit.history].sort((a, b) => 
        moment(a.date).diff(moment(b.date))
      );
      
      sortedHistory.forEach((entry, index) => {
        if (entry.completed) {
          currentStreak++;
          
          // Check if this is the last entry or if the next day doesn't continue the streak
          if (index === sortedHistory.length - 1 || 
              !moment(sortedHistory[index + 1].date).isSame(moment(entry.date).add(1, 'day'), 'day')) {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 0;
          }
        } else {
          currentStreak = 0;
        }
      });
      
      return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        completionRate,
        streak,
        longestStreak,
        daysCompleted,
        color: habit.color || '#4CAF50'
      };
    });
    
    setHabitStats(stats);
  };
  
  const handleOpenDialog = (habit = null) => {
    if (habit) {
      // Edit existing habit
      setEditingHabit(habit);
      setFormData({
        title: habit.title,
        description: habit.description || '',
        frequency: habit.frequency || 'daily',
        color: habit.color || '#4CAF50',
        reminder: habit.reminder || false
      });
    } else {
      // Create new habit with default values
      setEditingHabit(null);
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        color: '#4CAF50',
        reminder: false
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHabit(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('Please enter a title for your habit');
      return;
    }
    
    if (editingHabit) {
      // Update existing habit
      dispatch({
        type: 'UPDATE_HABIT',
        payload: {
          ...editingHabit,
          ...formData
        }
      });
      toast.success('Habit updated successfully');
    } else {
      // Create new habit
      dispatch({
        type: 'ADD_HABIT',
        payload: formData
      });
      toast.success('Habit added successfully');
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteHabit = (habitId) => {
    dispatch({ type: 'DELETE_HABIT', payload: habitId });
    toast.info('Habit deleted');
  };
  
  const handleTrackHabit = (habitId, completed) => {
    dispatch({ 
      type: 'TRACK_HABIT', 
      payload: { 
        habitId, 
        completed 
      } 
    });
    
    if (completed) {
      toast.success('Habit tracked for today!');
    } else {
      toast.info('Habit marked as incomplete for today');
    }
  };
  
  const isHabitCompletedToday = (habit) => {
    const today = moment().format('YYYY-MM-DD');
    return habit.history.some(entry => 
      moment(entry.date).isSame(today, 'day') && entry.completed
    );
  };
  
  const getMonthlyCalendarData = (habit) => {
    const monthStart = moment(selectedMonth).startOf('month');
    const monthEnd = moment(selectedMonth).endOf('month');
    const daysInMonth = monthEnd.diff(monthStart, 'days') + 1;
    
    const data = [];
    
    for (let i = 0; i < daysInMonth; i++) {
      const currentDate = moment(monthStart).add(i, 'days');
      const dateStr = currentDate.format('YYYY-MM-DD');
      
      const entry = habit.history.find(h => moment(h.date).isSame(dateStr, 'day'));
      
      data.push({
        date: currentDate.format('D'),
        completed: entry && entry.completed ? 1 : 0,
        tooltipDate: currentDate.format('MMM D, YYYY')
      });
    }
    
    return data;
  };
  
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };
  
  // Generate month options for the last 12 months
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const month = moment().subtract(i, 'months');
    monthOptions.push({
      value: month.format('YYYY-MM'),
      label: month.format('MMMM YYYY')
    });
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Habit Tracker</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Habit
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Monthly Overview
          </Typography>
          
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              displayEmpty
              size="small"
            >
              {monthOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {habitStats.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No habits found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start tracking your daily habits to build consistency and achieve your goals.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Your First Habit
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {habitStats.map(habit => (
            <Grid item xs={12} key={habit.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {habit.title}
                      </Typography>
                      
                      {habit.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {habit.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        <Chip 
                          label={`${habit.frequency}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          icon={<RepeatIcon />}
                        />
                        
                        <Chip 
                          label={`${habit.streak} day streak`} 
                          size="small" 
                          color={habit.streak > 5 ? "success" : "primary"}
                          icon={<FireIcon />}
                          sx={{ 
                            backgroundColor: habit.streak > 0 ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                            fontWeight: habit.streak > 0 ? 'bold' : 'normal'
                          }}
                        />
                        
                        <Chip 
                          label={`${habit.completionRate}% this month`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Tooltip title={isHabitCompletedToday(state.habits.find(h => h.id === habit.id)) ? "Mark as incomplete today" : "Mark as complete today"}>
                        <IconButton 
                          color={isHabitCompletedToday(state.habits.find(h => h.id === habit.id)) ? "success" : "default"}
                          onClick={() => handleTrackHabit(
                            habit.id, 
                            !isHabitCompletedToday(state.habits.find(h => h.id === habit.id))
                          )}
                          sx={{ mr: 1 }}
                        >
                          {isHabitCompletedToday(state.habits.find(h => h.id === habit.id)) 
                            ? <CheckCircleIcon fontSize="large" /> 
                            : <CheckCircleOutlineIcon fontSize="large" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Monthly Progress:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {habit.daysCompleted} / {moment(selectedMonth).daysInMonth()} days
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={habit.completionRate} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: habit.color
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ height: 150, mt: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getMonthlyCalendarData(state.habits.find(h => h.id === habit.id))}
                        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          hide 
                          domain={[0, 1]} 
                        />
                        <RechartsTooltip 
                          formatter={(value, name) => [value ? 'Completed' : 'Not completed', 'Status']}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                              return payload[0].payload.tooltipDate;
                            }
                            return label;
                          }}
                        />
                        <Bar 
                          dataKey="completed" 
                          fill={habit.color} 
                          radius={[2, 2, 0, 0]}
                          maxBarSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(state.habits.find(h => h.id === habit.id))}
                  >
                    Edit
                  </Button>
                  
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Habit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingHabit ? 'Edit Habit' : 'Add New Habit'}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Habit Title"
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
            rows={2}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="frequency-label">Frequency</InputLabel>
            <Select
              labelId="frequency-label"
              id="frequency"
              name="frequency"
              value={formData.frequency}
              label="Frequency"
              onChange={handleInputChange}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekdays">Weekdays</MenuItem>
              <MenuItem value="weekends">Weekends</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
            <FormHelperText>How often you want to perform this habit</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="color-label">Color</InputLabel>
            <Select
              labelId="color-label"
              id="color"
              name="color"
              value={formData.color}
              label="Color"
              onChange={handleInputChange}
            >
              <MenuItem value="#4CAF50">Green</MenuItem>
              <MenuItem value="#2196F3">Blue</MenuItem>
              <MenuItem value="#FFC107">Yellow</MenuItem>
              <MenuItem value="#F44336">Red</MenuItem>
              <MenuItem value="#9C27B0">Purple</MenuItem>
              <MenuItem value="#FF9800">Orange</MenuItem>
            </Select>
            <FormHelperText>Choose a color for your habit</FormHelperText>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.reminder}
                onChange={handleSwitchChange}
                name="reminder"
                color="primary"
              />
            }
            label="Enable reminders"
          />
          <FormHelperText>Get notifications to complete your habit</FormHelperText>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingHabit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Habits;
