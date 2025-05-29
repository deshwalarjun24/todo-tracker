import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
  Avatar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  LocalFireDepartment as FireIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getGradeFromScore } from '../utils/productivity';
import { getMotivationalQuote } from '../utils/quotes';
import moment from 'moment';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [quote, setQuote] = useState('');
  const [todayScore, setTodayScore] = useState(null);
  const [todayGoals, setTodayGoals] = useState([]);
  const [upcomingGoals, setUpcomingGoals] = useState([]);
  const [habitStats, setHabitStats] = useState([]);
  
  useEffect(() => {
    // Set a random motivational quote
    setQuote(getMotivationalQuote());
    
    // Get today's productivity score
    const today = moment().format('YYYY-MM-DD');
    const score = state.productivityScores.find(s => s.date === today);
    setTodayScore(score ? score.score : null);
    
    // Filter goals for today
    const todayGoalsList = state.goals.filter(goal => 
      moment(goal.deadline).isSame(moment(), 'day')
    ).sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by completion status
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      // Finally by creation date
      return moment(a.createdAt).diff(moment(b.createdAt));
    });
    
    setTodayGoals(todayGoalsList);
    
    // Filter upcoming goals (next 7 days, excluding today)
    const upcoming = state.goals.filter(goal => 
      moment(goal.deadline).isAfter(moment(), 'day') && 
      moment(goal.deadline).isBefore(moment().add(7, 'days'), 'day') &&
      !goal.completed
    ).sort((a, b) => moment(a.deadline).diff(moment(b.deadline)));
    
    setUpcomingGoals(upcoming.slice(0, 5)); // Show only top 5
    
    // Calculate habit stats
    const habitsWithStats = state.habits.map(habit => {
      const completionRate = habit.history.length > 0
        ? (habit.history.filter(entry => entry.completed).length / habit.history.length) * 100
        : 0;
      
      return {
        id: habit.id,
        name: habit.title,
        streak: habit.streak,
        completionRate: Math.round(completionRate),
      };
    }).sort((a, b) => b.streak - a.streak);
    
    setHabitStats(habitsWithStats.slice(0, 3)); // Show only top 3
  }, [state.goals, state.habits, state.productivityScores]);
  
  const handleToggleGoalCompletion = (goalId) => {
    dispatch({ type: 'TOGGLE_GOAL_COMPLETION', payload: goalId });
  };
  
  const getCompletionData = () => {
    const completed = todayGoals.filter(goal => goal.completed).length;
    const remaining = todayGoals.length - completed;
    
    return [
      { name: 'Completed', value: completed },
      { name: 'Remaining', value: remaining }
    ];
  };
  
  const COLORS = ['#4CAF50', '#E0E0E0'];
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Welcome Section with Quote */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              background: 'linear-gradient(120deg, #4CAF50 0%, #8BC34A 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome to Your Personal To-Do Tracker
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic', mt: 1 }}>
              "{quote}"
            </Typography>
          </Paper>
        </Grid>
        
        {/* Habit Stats */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
              >
                Today's Progress
              </Typography>
              
              {todayGoals.length > 0 ? (
                <>
                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', mb: 2, gap: isMobile ? 1 : 0 }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={todayGoals.filter(goal => goal.completed).length / todayGoals.length * 100} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {todayGoals.filter(goal => goal.completed).length}/{todayGoals.length} completed
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: isMobile ? 150 : 200 
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCompletionData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getCompletionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value, name) => [value, name]} 
                          contentStyle={{ fontSize: 14 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    gutterBottom
                  >
                    No habits tracked yet. Start by adding some habits!
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/habits')}
                    size="medium"
                    sx={{ mt: 1 }}
                  >
                    Add Habits
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Productivity Score and Completion Chart */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom
              >
                Productivity Score
              </Typography>
              
              {todayScore !== null ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      border: '8px solid',
                      borderColor: 'primary.main',
                      mb: 2
                    }}
                  >
                    <Typography variant="h3" component="div">
                      {getGradeFromScore(todayScore)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h5" gutterBottom>
                    {todayScore}/100
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Keep up the good work!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Complete tasks to see your productivity score
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Streak Information */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom
              >
                Streak Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FireIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography 
                    variant="h3" 
                    component="div"
                  >
                    {state.streaks.dailyGoals} days
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily goals completion streak
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Top Habit Streaks
              </Typography>
              
              {habitStats.length > 0 ? (
                <List>
                  {habitStats.map(habit => (
                    <ListItem key={habit.id}>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: 'secondary.light',
                          color: 'white',
                          width: 40,
                          height: 40
                        }}>
                          <FireIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={habit.name}
                        primaryTypographyProps={{
                          variant: "body1",
                          fontWeight: 500,
                          noWrap: true
                        }}
                        secondary={
                          <Stack 
                            direction="row" 
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography 
                              variant="body2" 
                              component="span"
                              noWrap
                            >
                              {habit.streak} day streak
                            </Typography>
                            <Typography 
                              variant="body2" 
                              component="span" 
                              sx={{ color: 'text.secondary' }}
                              noWrap
                            >
                              ({habit.completionRate}% completion)
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No habits tracked yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Today's Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row',
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 0
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium"
                >
                  Today's Overview
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ opacity: 0.9 }}
                >
                  {moment().format('dddd, MMMM D, YYYY')}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {todayGoals.length > 0 ? (
                <List>
                  {todayGoals.map((goal) => (
                    <ListItem 
                      key={goal.id}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={() => handleToggleGoalCompletion(goal.id)}
                        >
                          {goal.completed ? 
                            <CheckCircleIcon color="success" /> : 
                            <CheckCircleOutlineIcon />
                          }
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Tooltip title={`Priority: ${goal.priority}`}>
                          <FlagIcon 
                            color={
                              goal.priority === 'high' ? 'error' : 
                              goal.priority === 'medium' ? 'warning' : 
                              'success'
                            } 
                          />
                        </Tooltip>
                      </ListItemIcon>
                      <ListItemText 
                        primary={goal.title}
                        secondary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, maxWidth: isMobile ? '100%' : '80%' }}>
                            {goal.tags && goal.tags.map((tag) => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No tasks for today. Add some goals to get started!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Upcoming Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Upcoming Tasks
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/goals')}
                  size="medium"
                  sx={{ mt: 1 }}
                >
                  View All
                </Button>
              </Box>
              
              {upcomingGoals.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {upcomingGoals.map((goal) => (
                    <ListItem key={goal.id}>
                      <ListItemIcon>
                        <Tooltip title={`Priority: ${goal.priority}`}>
                          <FlagIcon 
                            color={
                              goal.priority === 'high' ? 'error' : 
                              goal.priority === 'medium' ? 'warning' : 
                              'success'
                            } 
                          />
                        </Tooltip>
                      </ListItemIcon>
                      <ListItemText 
                        primary={goal.title}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                            <Typography variant="caption">
                              {moment(goal.deadline).format('ddd, MMM D')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          size="small" 
                          label={goal.timeframe} 
                          color="primary"
                          variant="outlined"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No upcoming tasks for the next 7 days
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
