import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { useAppContext } from '../context/AppContext';
import moment from 'moment';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { generateProductivityInsights } from '../utils/productivity';

const Analytics = () => {
  const { state } = useAppContext();
  const [timeRange, setTimeRange] = useState('week');
  const [currentTab, setCurrentTab] = useState(0);
  const [goalData, setGoalData] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [insights, setInsights] = useState([]);
  
  const tabs = [
    { label: 'Goal Completion', value: 'goals' },
    { label: 'Productivity', value: 'productivity' },
    { label: 'Habits', value: 'habits' },
    { label: 'Categories', value: 'categories' }
  ];
  
  useEffect(() => {
    processData();
    generateInsights();
  }, [state.goals, state.habits, state.productivityScores, timeRange]);
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const processData = () => {
    // Determine date range based on selected time range
    let startDate;
    const endDate = moment();
    
    switch (timeRange) {
      case 'week':
        startDate = moment().subtract(7, 'days');
        break;
      case 'month':
        startDate = moment().subtract(30, 'days');
        break;
      case 'quarter':
        startDate = moment().subtract(90, 'days');
        break;
      case 'year':
        startDate = moment().subtract(365, 'days');
        break;
      default:
        startDate = moment().subtract(7, 'days');
    }
    
    // Process goal completion data
    processGoalData(startDate, endDate);
    
    // Process productivity score data
    processProductivityData(startDate, endDate);
    
    // Process habit data
    processHabitData(startDate, endDate);
    
    // Process category data
    processCategoryData(startDate, endDate);
  };
  
  const processGoalData = (startDate, endDate) => {
    // Filter goals within the date range
    const relevantGoals = state.goals.filter(goal => 
      moment(goal.deadline).isBetween(startDate, endDate, null, '[]')
    );
    
    // Group by timeframe
    const timeframes = ['daily', 'weekly', 'monthly', 'yearly'];
    const data = timeframes.map(timeframe => {
      const goalsInTimeframe = relevantGoals.filter(goal => goal.timeframe === timeframe);
      const completed = goalsInTimeframe.filter(goal => goal.completed).length;
      const total = goalsInTimeframe.length;
      
      return {
        name: timeframe.charAt(0).toUpperCase() + timeframe.slice(1),
        completed,
        missed: total - completed,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
    
    setGoalData(data);
  };
  
  const processProductivityData = (startDate, endDate) => {
    // Filter productivity scores within the date range
    const relevantScores = state.productivityScores.filter(score => 
      moment(score.date).isBetween(startDate, endDate, null, '[]')
    );
    
    // Sort by date
    relevantScores.sort((a, b) => moment(a.date).diff(moment(b.date)));
    
    // Format data for chart
    const data = relevantScores.map(score => ({
      date: moment(score.date).format('MMM D'),
      score: score.score,
      fullDate: moment(score.date).format('YYYY-MM-DD')
    }));
    
    setProductivityData(data);
  };
  
  const processHabitData = (startDate, endDate) => {
    // Process habit completion data
    const habitStats = state.habits.map(habit => {
      // Get all dates in range
      const dates = [];
      const current = moment(startDate);
      while (current.isSameOrBefore(endDate)) {
        dates.push(current.format('YYYY-MM-DD'));
        current.add(1, 'day');
      }
      
      // Count completions for each date
      const completions = dates.map(date => {
        const entry = habit.history.find(h => moment(h.date).format('YYYY-MM-DD') === date);
        return {
          date: moment(date).format('MMM D'),
          completed: entry && entry.completed ? 1 : 0,
          name: habit.title
        };
      });
      
      // Calculate completion rate
      const completionRate = completions.filter(c => c.completed).length / completions.length * 100;
      
      return {
        id: habit.id,
        name: habit.title,
        data: completions,
        completionRate: Math.round(completionRate),
        color: habit.color || '#4CAF50'
      };
    });
    
    setHabitData(habitStats);
  };
  
  const processCategoryData = (startDate, endDate) => {
    // Process category (tag) data
    const relevantGoals = state.goals.filter(goal => 
      moment(goal.deadline).isBetween(startDate, endDate, null, '[]') &&
      goal.tags && goal.tags.length > 0
    );
    
    // Count goals by tag
    const tagCounts = {};
    relevantGoals.forEach(goal => {
      goal.tags.forEach(tag => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = {
            completed: 0,
            total: 0
          };
        }
        
        tagCounts[tag].total += 1;
        if (goal.completed) {
          tagCounts[tag].completed += 1;
        }
      });
    });
    
    // Format data for chart
    const data = Object.keys(tagCounts).map(tag => ({
      name: tag,
      completed: tagCounts[tag].completed,
      missed: tagCounts[tag].total - tagCounts[tag].completed,
      total: tagCounts[tag].total,
      completionRate: Math.round((tagCounts[tag].completed / tagCounts[tag].total) * 100)
    }));
    
    setCategoryData(data);
  };
  
  const generateInsights = () => {
    const productivityInsights = generateProductivityInsights(state.goals, state.productivityScores);
    setInsights(productivityInsights);
  };
  
  // Colors for charts
  const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#00BCD4'];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 2 }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: entry.color, 
                  mr: 1, 
                  borderRadius: '50%' 
                }} 
              />
              <Typography variant="body2">
                {entry.name}: {entry.value} {entry.unit || ''}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics</Typography>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
            size="small"
          >
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="quarter">Last 90 Days</MenuItem>
            <MenuItem value="year">Last 365 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
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
      
      {/* Goal Completion Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Goal Completion by Timeframe
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={goalData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="completed" 
                        stackId="a" 
                        name="Completed" 
                        fill="#4CAF50" 
                      />
                      <Bar 
                        dataKey="missed" 
                        stackId="a" 
                        name="Missed" 
                        fill="#F44336" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completion Rate
                </Typography>
                <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={goalData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {goalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name, props) => [`${value} goals`, props.payload.name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completion Rate by Timeframe
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={goalData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Completion Rate (%)"
                        dataKey="completionRate"
                        stroke="#8BC34A"
                        fill="#8BC34A"
                        fillOpacity={0.6}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Productivity Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Productivity Score Trend
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={productivityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}`, 'Productivity Score']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            return payload[0].payload.fullDate;
                          }
                          return label;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4CAF50"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Productivity Insights
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {insights.length > 0 ? (
                  <Grid container spacing={2}>
                    {insights.map((insight, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body1">{insight}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    Complete more tasks to unlock personalized productivity insights!
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Habits Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Habit Completion Rates
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={habitData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                      <Bar dataKey="completionRate">
                        {habitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {habitData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Habit Streak Comparison
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart 
                        cx="50%" 
                        cy="50%" 
                        outerRadius="80%" 
                        data={state.habits.map(habit => ({
                          name: habit.title,
                          streak: habit.streak,
                          fullMark: Math.max(...state.habits.map(h => h.streak), 10)
                        }))}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Radar 
                          name="Current Streak (days)" 
                          dataKey="streak" 
                          stroke="#8BC34A" 
                          fill="#8BC34A" 
                          fillOpacity={0.6} 
                        />
                        <RechartsTooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Categories Tab */}
      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Goal Completion by Category
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="completed" 
                        stackId="a" 
                        name="Completed" 
                        fill="#4CAF50" 
                      />
                      <Bar 
                        dataKey="missed" 
                        stackId="a" 
                        name="Missed" 
                        fill="#F44336" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completion Rate by Category
                </Typography>
                <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name, props) => [`${value} goals`, props.payload.name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;
