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
  Avatar,
  Container,
  SwipeableDrawer
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  LocalFireDepartment as FireIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  EmojiEvents as TrophyIcon,
  Edit as EditIcon,
  Close as CloseIcon
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
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery('(max-width:400px)');
  const isVerySmallScreen = useMediaQuery('(max-width:320px)');
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  const [quote, setQuote] = useState('');
  const [todayScore, setTodayScore] = useState(null);
  const [todayGoals, setTodayGoals] = useState([]);
  const [upcomingGoals, setUpcomingGoals] = useState([]);
  const [habitStats, setHabitStats] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
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
  
  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Mobile Goal Details Drawer */}
        <SwipeableDrawer
          anchor="bottom"
          open={detailsOpen}
          onClose={handleCloseDetails}
          onOpen={() => {}}
          disableSwipeToOpen
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '85vh',
              overflow: 'auto'
            }
          }}
        >
          {selectedGoal && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Goal Details
                </Typography>
                <IconButton onClick={handleCloseDetails} edge="end" size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                {selectedGoal.title}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Priority
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FlagIcon 
                        color={
                          selectedGoal.priority === 'high' ? 'error' : 
                          selectedGoal.priority === 'medium' ? 'warning' : 
                          'success'
                        } 
                        sx={{ mr: 1, fontSize: 20 }}
                      />
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {selectedGoal.priority}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Timeframe
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {selectedGoal.timeframe}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Deadline
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ mr: 1, fontSize: 20, opacity: 0.7 }} />
                      <Typography variant="body1">
                        {moment(selectedGoal.deadline).format('dddd, MMMM D, YYYY')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {selectedGoal.description && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedGoal.description || 'No description provided'}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedGoal.tags && selectedGoal.tags.length > 0 ? selectedGoal.tags.map(tag => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          variant="outlined"
                        />
                      )) : (
                        <Typography variant="body2" color="text.secondary">
                          No tags
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => navigate(`/goals/edit/${selectedGoal.id}`)}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
                
                <Button 
                  variant={selectedGoal.completed ? "outlined" : "contained"} 
                  color={selectedGoal.completed ? "secondary" : "primary"}
                  onClick={() => {
                    handleToggleGoalCompletion(selectedGoal.id);
                    handleCloseDetails();
                  }}
                  startIcon={selectedGoal.completed ? <CheckCircleOutlineIcon /> : <CheckCircleIcon />}
                >
                  {selectedGoal.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
              </Box>
            </Box>
          )}
        </SwipeableDrawer>
        {/* Welcome Section with Quote */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: isExtraSmallScreen ? 2 : 3, 
              borderRadius: 2,
              background: 'linear-gradient(120deg, #4CAF50 0%, #8BC34A 100%)',
              color: 'white'
            }}
          >
            <Typography 
              variant={isExtraSmallScreen ? (isVerySmallScreen ? "h6" : "h5") : "h4"} 
              gutterBottom
              sx={{
                fontSize: isVerySmallScreen ? '1.1rem' : (isExtraSmallScreen ? '1.3rem' : undefined),
                lineHeight: 1.3
              }}
            >
              {isVerySmallScreen ? 'Welcome!' : 'Welcome to Your Personal To-Do Tracker'}
            </Typography>
            <Typography 
              variant={isExtraSmallScreen ? "body2" : "body1"} 
              sx={{ 
                fontStyle: 'italic', 
                mt: isExtraSmallScreen ? 0.5 : 1,
                fontSize: isVerySmallScreen ? '0.85rem' : undefined
              }}
            >
              "{quote}"
            </Typography>
          </Paper>
        </Grid>
        
        {/* Habit Stats */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%', borderRadius: isMobile ? 2 : 3 }}>
            <CardContent sx={{ p: isExtraSmallScreen ? 1.5 : 2 }}>
              <Typography 
                variant={isExtraSmallScreen ? "subtitle1" : "h6"} 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Today's Progress
              </Typography>
              
              {todayGoals.length > 0 ? (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row', 
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    mb: isExtraSmallScreen ? 1 : 2, 
                    gap: isMobile ? 0.5 : 0 
                  }}>
                    <Box sx={{ 
                      flexGrow: 1, 
                      mr: isMobile ? 0 : 2,
                      width: '100%',
                      mb: isMobile ? 0.5 : 0
                    }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={todayGoals.filter(goal => goal.completed).length / todayGoals.length * 100} 
                        sx={{ 
                          height: isExtraSmallScreen ? 8 : 10, 
                          borderRadius: 5,
                          '& .MuiLinearProgress-bar': {
                            transition: 'transform 0.5s ease-in-out'
                          }
                        }}
                      />
                    </Box>
                    <Typography 
                      variant={isExtraSmallScreen ? "caption" : "body2"} 
                      color="text.secondary"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {todayGoals.filter(goal => goal.completed).length}/{todayGoals.length} completed
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: isVerySmallScreen ? 100 : (isExtraSmallScreen ? 120 : (isMobile ? 140 : (isLandscape ? 120 : 180))),
                    overflow: 'visible'
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={getCompletionData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={isVerySmallScreen ? 30 : (isExtraSmallScreen ? 35 : (isMobile ? 45 : 60))}
                          outerRadius={isVerySmallScreen ? 45 : (isExtraSmallScreen ? 55 : (isMobile ? 65 : 80))}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={800}
                          animationBegin={200}
                        >
                          {getCompletionData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              strokeWidth={isExtraSmallScreen ? 1 : 2}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value, name) => [value, name]} 
                          contentStyle={{ 
                            fontSize: isExtraSmallScreen ? 11 : 14,
                            padding: isExtraSmallScreen ? '4px 8px' : '8px 12px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          wrapperStyle={{ zIndex: 5 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: isExtraSmallScreen ? 2 : 3 }}>
                  <Typography 
                    variant={isExtraSmallScreen ? "body2" : "body1"} 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ px: isExtraSmallScreen ? 1 : 2 }}
                  >
                    No habits tracked yet. Start by adding some habits!
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/habits')}
                    size={isExtraSmallScreen ? "small" : "medium"}
                    sx={{ 
                      mt: isExtraSmallScreen ? 0.5 : 1,
                      px: isExtraSmallScreen ? 2 : 3,
                      py: isExtraSmallScreen ? 0.5 : 1,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 500
                    }}
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
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: isMobile ? 2 : 3
          }}>
            <CardContent sx={{ 
              flexGrow: 1,
              p: isExtraSmallScreen ? 1.5 : 2
            }}>
              <Typography 
                variant={isExtraSmallScreen ? "subtitle1" : "h6"} 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Productivity Score
              </Typography>
              
              {todayScore !== null ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: isVerySmallScreen ? 0.5 : (isExtraSmallScreen ? 1 : 2),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: isVerySmallScreen ? 70 : (isExtraSmallScreen ? 80 : (isLandscape ? 90 : 120)),
                      height: isVerySmallScreen ? 70 : (isExtraSmallScreen ? 80 : (isLandscape ? 90 : 120)),
                      borderRadius: '50%',
                      border: isVerySmallScreen ? '5px solid' : (isExtraSmallScreen ? '6px solid' : '8px solid'),
                      borderColor: 'primary.main',
                      mb: isExtraSmallScreen ? 1 : 2,
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    <Typography 
                      variant={isVerySmallScreen ? "h5" : (isExtraSmallScreen ? "h4" : "h3")} 
                      component="div"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isVerySmallScreen ? '1.5rem' : undefined
                      }}
                    >
                      {getGradeFromScore(todayScore)}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant={isVerySmallScreen ? "subtitle1" : (isExtraSmallScreen ? "h6" : "h5")} 
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    {todayScore}/100
                  </Typography>
                  
                  <Typography 
                    variant={isExtraSmallScreen ? "caption" : "body2"} 
                    color="text.secondary"
                  >
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
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: isMobile ? 2 : 3
          }}>
            <CardContent sx={{ 
              flexGrow: 1,
              p: isExtraSmallScreen ? 1.5 : 2
            }}>
              <Typography 
                variant={isExtraSmallScreen ? "subtitle1" : "h6"} 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Streak Information
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: isExtraSmallScreen ? 2 : 3,
                mt: isExtraSmallScreen ? 0.5 : 0
              }}>
                <FireIcon 
                  color="error" 
                  sx={{ 
                    fontSize: isVerySmallScreen ? 32 : (isExtraSmallScreen ? 36 : 40), 
                    mr: isExtraSmallScreen ? 1.5 : 2 
                  }} 
                />
                <Box>
                  <Typography 
                    variant={isVerySmallScreen ? "h4" : (isExtraSmallScreen ? "h4" : "h3")} 
                    component="div"
                    sx={{ 
                      lineHeight: 1.2,
                      fontSize: isVerySmallScreen ? '1.8rem' : undefined
                    }}
                  >
                    {state.streaks.dailyGoals} days
                  </Typography>
                  <Typography 
                    variant={isExtraSmallScreen ? "caption" : "body2"} 
                    color="text.secondary"
                  >
                    Daily goals completion streak
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: isExtraSmallScreen ? 1.5 : 2 }} />
              
              <Typography 
                variant={isExtraSmallScreen ? "body2" : "subtitle2"} 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Top Habit Streaks
              </Typography>
              
              {habitStats.length > 0 ? (
                <List sx={{ 
                  py: 0,
                  '& .MuiListItem-root': {
                    px: isExtraSmallScreen ? 0.5 : 2,
                    py: isExtraSmallScreen ? 0.5 : 1
                  }
                }}>
                  {habitStats.map(habit => (
                    <ListItem key={habit.id}>
                      <ListItemIcon sx={{ minWidth: isExtraSmallScreen ? 40 : 56 }}>
                        <Avatar sx={{ 
                          bgcolor: 'secondary.light',
                          color: 'white',
                          width: isExtraSmallScreen ? 32 : 40,
                          height: isExtraSmallScreen ? 32 : 40
                        }}>
                          <FireIcon sx={{ fontSize: isExtraSmallScreen ? 18 : 24 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={habit.name}
                        primaryTypographyProps={{
                          variant: isExtraSmallScreen ? "body2" : "body1",
                          fontWeight: 500,
                          noWrap: true,
                          fontSize: isVerySmallScreen ? '0.8rem' : undefined
                        }}
                        secondary={
                          <Stack 
                            direction={isVerySmallScreen ? "column" : "row"} 
                            spacing={isVerySmallScreen ? 0 : 1}
                            alignItems={isVerySmallScreen ? "flex-start" : "center"}
                          >
                            <Typography 
                              variant={isExtraSmallScreen ? "caption" : "body2"} 
                              component="span"
                              noWrap
                              sx={{ lineHeight: isVerySmallScreen ? 1.2 : 1.5 }}
                            >
                              {habit.streak} day streak
                            </Typography>
                            <Typography 
                              variant={isExtraSmallScreen ? "caption" : "body2"} 
                              component="span" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: isVerySmallScreen ? '0.65rem' : undefined
                              }}
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
          <Card sx={{ borderRadius: isMobile ? 2 : 3 }}>
            <CardContent sx={{ p: isExtraSmallScreen ? 1.5 : 2 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isExtraSmallScreen ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isExtraSmallScreen ? 'flex-start' : 'center',
                gap: isExtraSmallScreen ? 0.5 : 0
              }}>
                <Typography 
                  variant={isExtraSmallScreen ? "body1" : "subtitle1"} 
                  fontWeight="medium"
                  sx={{ 
                    fontSize: isVerySmallScreen ? '0.9rem' : undefined,
                    fontWeight: 600
                  }}
                >
                  Today's Overview
                </Typography>
                <Typography 
                  variant={isExtraSmallScreen ? "caption" : "body2"}
                  sx={{ 
                    opacity: 0.9,
                    fontSize: isVerySmallScreen ? '0.7rem' : undefined
                  }}
                >
                  {isVerySmallScreen
                    ? moment().format('M/D/YY')
                    : (isExtraSmallScreen 
                      ? moment().format('MMM D, YYYY') 
                      : moment().format('dddd, MMMM D, YYYY'))}
                </Typography>
              </Box>
              
              <Divider sx={{ my: isExtraSmallScreen ? 1.5 : 2 }} />
              
              {todayGoals.length > 0 ? (
                <List sx={{ 
                  py: 0,
                  '& .MuiListItem-root': {
                    px: isExtraSmallScreen ? 0.5 : 2,
                    py: isExtraSmallScreen ? 0.75 : 1
                  }
                }}>
                  {todayGoals.map((goal) => (
                    <ListItem 
                      key={goal.id}
                      onClick={() => isMobile && handleGoalClick(goal)}
                      sx={{ 
                        cursor: isMobile ? 'pointer' : 'default',
                        '&:hover': isMobile ? { bgcolor: 'rgba(0,0,0,0.03)' } : {}
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleGoalCompletion(goal.id);
                          }}
                          size={isExtraSmallScreen ? "small" : "medium"}
                          sx={{ mr: isExtraSmallScreen ? -0.5 : 0 }}
                        >
                          {goal.completed ? 
                            <CheckCircleIcon color="success" /> : 
                            <CheckCircleOutlineIcon />
                          }
                        </IconButton>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: isExtraSmallScreen ? 36 : 56 }}>
                        <Tooltip title={`Priority: ${goal.priority}`}>
                          <FlagIcon 
                            color={
                              goal.priority === 'high' ? 'error' : 
                              goal.priority === 'medium' ? 'warning' : 
                              'success'
                            } 
                            sx={{ fontSize: isExtraSmallScreen ? 20 : 24 }}
                          />
                        </Tooltip>
                      </ListItemIcon>
                      <ListItemText 
                        primary={goal.title}
                        primaryTypographyProps={{
                          variant: isExtraSmallScreen ? "body2" : "body1",
                          fontWeight: 500,
                          sx: { 
                            textDecoration: goal.completed ? 'line-through' : 'none',
                            opacity: goal.completed ? 0.7 : 1,
                            fontSize: isVerySmallScreen ? '0.85rem' : undefined
                          }
                        }}
                        secondary={
                          <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 0.5, 
                            mt: 0.5, 
                            maxWidth: isMobile ? '100%' : '80%' 
                          }}>
                            {goal.tags && goal.tags.length > 0 ? goal.tags.map((tag) => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  height: isExtraSmallScreen ? 18 : 20,
                                  '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: isExtraSmallScreen ? '0.65rem' : '0.75rem'
                                  }
                                }}
                              />
                            )) : (
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontSize: isVerySmallScreen ? '0.65rem' : undefined }}
                              >
                                No tags
                              </Typography>
                            )}
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
          <Card sx={{ borderRadius: isMobile ? 2 : 3 }}>
            <CardContent sx={{ p: isExtraSmallScreen ? 1.5 : 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: isExtraSmallScreen ? 1.5 : 2,
                flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
                gap: isVerySmallScreen ? 1 : 0
              }}>
                <Typography 
                  variant={isExtraSmallScreen ? "subtitle1" : "h6"}
                  sx={{ 
                    fontWeight: 600,
                    fontSize: isVerySmallScreen ? '1rem' : undefined,
                    width: isVerySmallScreen ? '100%' : 'auto'
                  }}
                >
                  Upcoming Tasks
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/goals')}
                  size={isExtraSmallScreen ? "small" : "medium"}
                  sx={{ 
                    mt: isVerySmallScreen ? 0 : 1,
                    fontSize: isExtraSmallScreen ? '0.75rem' : undefined,
                    py: isExtraSmallScreen ? 0.5 : 1,
                    width: isVerySmallScreen ? '100%' : 'auto',
                    textTransform: 'none',
                    borderRadius: '8px'
                  }}
                >
                  View All
                </Button>
              </Box>
              
              {upcomingGoals.length > 0 ? (
                <List sx={{ 
                  width: '100%',
                  py: 0,
                  '& .MuiListItem-root': {
                    px: isExtraSmallScreen ? 0.5 : 2,
                    py: isExtraSmallScreen ? 0.75 : 1
                  }
                }}>
                  {upcomingGoals.map((goal) => (
                    <ListItem 
                      key={goal.id}
                      onClick={() => isMobile && handleGoalClick(goal)}
                      sx={{ 
                        cursor: isMobile ? 'pointer' : 'default',
                        '&:hover': isMobile ? { bgcolor: 'rgba(0,0,0,0.03)' } : {}
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: isExtraSmallScreen ? 36 : 56 }}>
                        <Tooltip title={`Priority: ${goal.priority}`}>
                          <FlagIcon 
                            color={
                              goal.priority === 'high' ? 'error' : 
                              goal.priority === 'medium' ? 'warning' : 
                              'success'
                            } 
                            sx={{ fontSize: isExtraSmallScreen ? 20 : 24 }}
                          />
                        </Tooltip>
                      </ListItemIcon>
                      <ListItemText 
                        primary={goal.title}
                        primaryTypographyProps={{
                          variant: isExtraSmallScreen ? "body2" : "body1",
                          fontWeight: 500,
                          sx: { fontSize: isVerySmallScreen ? '0.85rem' : undefined }
                        }}
                        secondary={
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mt: 0.5,
                            flexWrap: 'nowrap'
                          }}>
                            <AccessTimeIcon 
                              fontSize="small" 
                              sx={{ 
                                mr: 0.5, 
                                fontSize: isExtraSmallScreen ? 14 : 16,
                                opacity: 0.7
                              }} 
                            />
                            <Typography 
                              variant="caption"
                              sx={{ fontSize: isVerySmallScreen ? '0.65rem' : undefined }}
                            >
                              {moment(goal.deadline).format(isVerySmallScreen ? 'M/D' : 'ddd, MMM D')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction sx={{ right: isExtraSmallScreen ? 8 : 16 }}>
                        <Chip 
                          size="small" 
                          label={goal.timeframe} 
                          color="primary"
                          variant="outlined"
                          sx={{ 
                            height: isExtraSmallScreen ? 20 : 24,
                            '& .MuiChip-label': {
                              px: isExtraSmallScreen ? 0.75 : 1,
                              fontSize: isExtraSmallScreen ? '0.65rem' : '0.75rem'
                            }
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: isExtraSmallScreen ? 2 : 3 }}>
                  <Typography 
                    variant={isExtraSmallScreen ? "body2" : "body1"} 
                    color="text.secondary"
                    sx={{ fontSize: isVerySmallScreen ? '0.85rem' : undefined }}
                  >
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
