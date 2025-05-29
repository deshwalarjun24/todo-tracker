import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Chip,
  Avatar,
  Button
} from '@mui/material';
import { 
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  Whatshot as HotstreakIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Repeat as RepeatIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { getContextualQuote } from '../utils/quotes';
import moment from 'moment';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

const Streaks = () => {
  const { state } = useAppContext();
  const [streakData, setStreakData] = useState([]);
  const [habitStreaks, setHabitStreaks] = useState([]);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    // Set a contextual motivational quote
    setMotivationalQuote(getContextualQuote('streak'));
    
    // Process streak data
    processStreakData();
    
    // Generate achievements
    generateAchievements();
  }, [state.goals, state.habits, state.streaks]);
  
  const processStreakData = () => {
    // Process daily goals streak data
    const dailyGoalsStreak = state.streaks.dailyGoals;
    
    // Generate data for the last 30 days
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');
      
      // Check if all daily goals were completed on this date
      const goalsForDate = state.goals.filter(goal => 
        goal.timeframe === 'daily' && 
        moment(goal.deadline).format('YYYY-MM-DD') === dateStr
      );
      
      const allCompleted = goalsForDate.length > 0 && 
        goalsForDate.every(goal => goal.completed);
      
      last30Days.push({
        date: date.format('MMM D'),
        completed: allCompleted ? 1 : 0,
        fullDate: dateStr
      });
    }
    
    setStreakData({
      currentStreak: dailyGoalsStreak,
      last30Days
    });
    
    // Process habit streaks
    const habits = state.habits.map(habit => ({
      id: habit.id,
      name: habit.title,
      streak: habit.streak,
      frequency: habit.frequency,
      color: habit.color || '#4CAF50'
    })).sort((a, b) => b.streak - a.streak);
    
    setHabitStreaks(habits);
  };
  
  const generateAchievements = () => {
    const achievementsList = [];
    
    // Daily goals streak achievements
    if (state.streaks.dailyGoals >= 3) {
      achievementsList.push({
        title: 'On Fire!',
        description: `${state.streaks.dailyGoals} day streak of completing all daily goals`,
        icon: <FireIcon />,
        color: '#F44336',
        value: state.streaks.dailyGoals
      });
    }
    
    // Habit streak achievements
    state.habits.forEach(habit => {
      if (habit.streak >= 7) {
        achievementsList.push({
          title: 'Habit Master',
          description: `${habit.streak} day streak for "${habit.title}"`,
          icon: <RepeatIcon />,
          color: '#2196F3',
          value: habit.streak
        });
      }
    });
    
    // Goal completion achievements
    const completedGoals = state.goals.filter(goal => goal.completed).length;
    if (completedGoals >= 10) {
      achievementsList.push({
        title: 'Goal Crusher',
        description: `Completed ${completedGoals} goals`,
        icon: <CheckCircleIcon />,
        color: '#4CAF50',
        value: completedGoals
      });
    }
    
    // High priority goal achievements
    const highPriorityCompleted = state.goals.filter(
      goal => goal.completed && goal.priority === 'high'
    ).length;
    
    if (highPriorityCompleted >= 5) {
      achievementsList.push({
        title: 'Priority Master',
        description: `Completed ${highPriorityCompleted} high priority goals`,
        icon: <StarIcon />,
        color: '#FFC107',
        value: highPriorityCompleted
      });
    }
    
    // Sort achievements by value (descending)
    achievementsList.sort((a, b) => b.value - a.value);
    
    setAchievements(achievementsList);
  };
  
  const getStreakLevel = (streak) => {
    if (streak >= 30) return { level: 'Diamond', color: '#B9F2FF' };
    if (streak >= 14) return { level: 'Platinum', color: '#E5E4E2' };
    if (streak >= 7) return { level: 'Gold', color: '#FFD700' };
    if (streak >= 3) return { level: 'Silver', color: '#C0C0C0' };
    return { level: 'Bronze', color: '#CD7F32' };
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Streaks & Achievements
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: 'linear-gradient(120deg, #FF9800 0%, #F44336 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Motivational Quote
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            "{motivationalQuote}"
          </Typography>
        </Paper>
      </Box>
      
      <Grid container spacing={3}>
        {/* Current Streak Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Goals Streak
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                py: 3
              }}>
                <Box 
                  sx={{ 
                    position: 'relative',
                    width: 150,
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <FireIcon 
                    sx={{ 
                      position: 'absolute',
                      fontSize: 150,
                      color: 'error.main',
                      opacity: 0.2,
                      zIndex: 0
                    }} 
                  />
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontWeight: 'bold',
                      zIndex: 1
                    }}
                  >
                    {streakData.currentStreak}
                  </Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {streakData.currentStreak > 0 ? 'Day Streak!' : 'No Active Streak'}
                </Typography>
                
                <Chip 
                  label={getStreakLevel(streakData.currentStreak).level} 
                  sx={{ 
                    backgroundColor: getStreakLevel(streakData.currentStreak).color,
                    color: '#000',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                />
                
                <Typography variant="body2" color="text.secondary" align="center">
                  {streakData.currentStreak > 0 
                    ? "Keep going! Complete all of today's goals to continue your streak."
                    : "Complete all of today's goals to start a new streak!"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Streak History Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Last 30 Days History
              </Typography>
              
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={streakData.last30Days}
                    margin={{ top: 5, right: 5, bottom: 20, left: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      interval={2}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis 
                      domain={[0, 1]} 
                      tickCount={2}
                      tick={false}
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [value ? 'Completed' : 'Missed', 'Status']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.fullDate;
                        }
                        return label;
                      }}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="#FF9800" 
                      radius={[2, 2, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: '#FF9800', 
                    mr: 1, 
                    borderRadius: 1 
                  }} 
                />
                <Typography variant="body2" color="text.secondary">
                  = All daily goals completed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Habit Streaks Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Habit Streaks
              </Typography>
              
              {habitStreaks.length > 0 ? (
                <List>
                  {habitStreaks.map((habit) => (
                    <React.Fragment key={habit.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: habit.color,
                              width: 40,
                              height: 40
                            }}
                          >
                            <HotstreakIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={habit.name}
                          secondary={`${habit.frequency} habit`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 'bold', 
                              mr: 1,
                              color: habit.streak > 0 ? 'text.primary' : 'text.secondary'
                            }}
                          >
                            {habit.streak}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            days
                          </Typography>
                        </Box>
                      </ListItem>
                      <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, (habit.streak / 30) * 100)} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 5,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: habit.color
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            0 days
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            30 days
                          </Typography>
                        </Box>
                      </Box>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No habits found
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => window.location.href = '/habits'}
                    sx={{ mt: 2 }}
                  >
                    Create Habits
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Achievements Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Achievements
              </Typography>
              
              {achievements.length > 0 ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {achievements.map((achievement, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderRadius: 2,
                          height: '100%'
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: achievement.color,
                            width: 60,
                            height: 60,
                            mb: 2
                          }}
                        >
                          {achievement.icon || <TrophyIcon />}
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                          {achievement.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Complete goals and maintain streaks to earn achievements!
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

export default Streaks;
