import moment from 'moment';

/**
 * Calculate productivity score based on completed tasks, their difficulty,
 * special flags, and consistency
 * 
 * @param {Array} goals - Array of goals for the day
 * @param {Array} habits - Array of habits
 * @param {Object} streaks - Object containing streak information
 * @returns {Number} - Productivity score from 0-100
 */
export const calculateProductivityScore = (goals, habits, streaks) => {
  // Base score starts at 50
  let score = 50;
  
  // Calculate completion percentage of goals
  const completedGoals = goals.filter(goal => goal.completed);
  const completionPercentage = goals.length > 0 
    ? (completedGoals.length / goals.length) * 100 
    : 0;
  
  // Add points based on completion percentage (up to 25 points)
  score += (completionPercentage / 4);
  
  // Add points for difficulty (up to 10 points)
  const difficultyScore = completedGoals.reduce((total, goal) => {
    // Convert priority to number: high=3, medium=2, low=1
    const priorityValue = 
      goal.priority === 'high' ? 3 : 
      goal.priority === 'medium' ? 2 : 1;
    
    return total + priorityValue;
  }, 0);
  
  // Normalize difficulty score to max 10 points
  score += Math.min(10, difficultyScore);
  
  // Add points for streaks (up to 10 points)
  const streakScore = Math.min(10, streaks.dailyGoals);
  score += streakScore;
  
  // Add points for habits completed today (up to 5 points)
  const today = moment().format('YYYY-MM-DD');
  const habitsCompletedToday = habits.filter(habit => 
    habit.history.some(entry => 
      moment(entry.date).isSame(today, 'day') && entry.completed
    )
  );
  
  const habitScore = Math.min(5, habitsCompletedToday.length);
  score += habitScore;
  
  // Cap the score at 100
  return Math.min(100, Math.round(score));
};

/**
 * Get letter grade based on numerical score
 * 
 * @param {Number} score - Numerical score from 0-100
 * @returns {String} - Letter grade (A+, A, B+, etc.)
 */
export const getGradeFromScore = (score) => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
};

/**
 * Generate productivity insights based on historical data
 * 
 * @param {Array} goals - Array of all goals
 * @param {Array} productivityScores - Array of daily productivity scores
 * @returns {Array} - Array of insight strings
 */
export const generateProductivityInsights = (goals, productivityScores) => {
  const insights = [];
  
  // Check if we have enough data
  if (goals.length < 7 || productivityScores.length < 7) {
    insights.push("Complete more tasks to unlock personalized productivity insights!");
    return insights;
  }
  
  // Analyze productivity by day of week
  const dayProductivity = {
    0: [], // Sunday
    1: [], // Monday
    2: [], // Tuesday
    3: [], // Wednesday
    4: [], // Thursday
    5: [], // Friday
    6: []  // Saturday
  };
  
  productivityScores.forEach(entry => {
    const dayOfWeek = moment(entry.date).day();
    dayProductivity[dayOfWeek].push(entry.score);
  });
  
  // Calculate average for each day
  const dayAverages = Object.keys(dayProductivity).map(day => {
    const scores = dayProductivity[day];
    const avg = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
    return { day: parseInt(day), average: avg };
  });
  
  // Find most productive day
  const mostProductiveDay = dayAverages.reduce(
    (best, current) => current.average > best.average ? current : best,
    { day: 0, average: 0 }
  );
  
  if (mostProductiveDay.average > 0) {
    const dayName = moment().day(mostProductiveDay.day).format('dddd');
    insights.push(`You're most productive on ${dayName}s with an average score of ${Math.round(mostProductiveDay.average)}.`);
  }
  
  // Analyze task batch sizes
  const dailyTaskCounts = {};
  goals.forEach(goal => {
    const date = moment(goal.deadline).format('YYYY-MM-DD');
    dailyTaskCounts[date] = (dailyTaskCounts[date] || 0) + 1;
  });
  
  // Group by task count
  const taskCountGroups = {};
  Object.keys(dailyTaskCounts).forEach(date => {
    const count = dailyTaskCounts[date];
    if (!taskCountGroups[count]) {
      taskCountGroups[count] = [];
    }
    
    const score = productivityScores.find(s => s.date === date);
    if (score) {
      taskCountGroups[count].push(score.score);
    }
  });
  
  // Find optimal task batch size
  let optimalBatchSize = 0;
  let highestAverage = 0;
  
  Object.keys(taskCountGroups).forEach(count => {
    const scores = taskCountGroups[count];
    if (scores.length >= 3) { // Only consider if we have enough data points
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avg > highestAverage) {
        highestAverage = avg;
        optimalBatchSize = parseInt(count);
      }
    }
  });
  
  if (optimalBatchSize > 0) {
    insights.push(`You perform best when you plan ${optimalBatchSize} tasks per day.`);
  }
  
  // Check consistency
  const recentScores = productivityScores
    .sort((a, b) => moment(b.date).diff(moment(a.date)))
    .slice(0, 7);
    
  if (recentScores.length >= 5) {
    const scoreValues = recentScores.map(s => s.score);
    const avgScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
    const variance = scoreValues.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scoreValues.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 10) {
      insights.push("You're maintaining consistent productivity levels. Great job staying steady!");
    } else if (stdDev > 20) {
      insights.push("Your productivity varies significantly day to day. Try to establish a more consistent routine.");
    }
  }
  
  return insights;
};
