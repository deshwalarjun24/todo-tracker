import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { calculateProductivityScore } from '../utils/productivity';
import { getMotivationalQuote } from '../utils/quotes';

// Initial state
const initialState = {
  goals: [],
  habits: [],
  theme: 'light',
  productivityScores: [],
  streaks: {
    dailyGoals: 0,
    habits: {}
  },
  notifications: [],
  tags: ['Personal', 'Work', 'Health', 'Learning', 'Finance', 'Social']
};

// Load state from localStorage if available
const loadState = () => {
  try {
    const savedState = localStorage.getItem('todoTrackerState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return initialState;
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return initialState;
  }
};

// Reducer function
const appReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'ADD_GOAL':
      newState = {
        ...state,
        goals: [...state.goals, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString(), completed: false }]
      };
      break;
      
    case 'UPDATE_GOAL':
      newState = {
        ...state,
        goals: state.goals.map(goal => 
          goal.id === action.payload.id ? { ...goal, ...action.payload } : goal
        )
      };
      break;
      
    case 'DELETE_GOAL':
      newState = {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload)
      };
      break;
      
    case 'TOGGLE_GOAL_COMPLETION':
      const goalToToggle = state.goals.find(goal => goal.id === action.payload);
      const isCompleting = !goalToToggle.completed;
      
      // Update streaks if it's a daily goal
      let updatedStreaks = { ...state.streaks };
      if (goalToToggle.timeframe === 'daily') {
        if (isCompleting) {
          // Check if all daily goals for today are completed
          const todayDailyGoals = state.goals.filter(
            goal => goal.timeframe === 'daily' && 
            moment(goal.deadline).isSame(moment(), 'day')
          );
          
          const allCompleted = todayDailyGoals.every(
            goal => goal.id === action.payload || goal.completed
          );
          
          if (allCompleted) {
            updatedStreaks.dailyGoals += 1;
          }
        } else {
          // If uncompleting a daily goal, potentially reduce streak
          updatedStreaks.dailyGoals = Math.max(0, updatedStreaks.dailyGoals - 1);
        }
      }
      
      newState = {
        ...state,
        goals: state.goals.map(goal => 
          goal.id === action.payload 
            ? { 
                ...goal, 
                completed: !goal.completed,
                completedAt: !goal.completed ? new Date().toISOString() : null
              } 
            : goal
        ),
        streaks: updatedStreaks
      };
      
      // Calculate productivity score for today if completing a goal
      if (isCompleting) {
        const todayScore = calculateProductivityScore(
          newState.goals.filter(g => moment(g.deadline).isSame(moment(), 'day')),
          newState.habits,
          newState.streaks
        );
        
        newState.productivityScores = [
          ...state.productivityScores.filter(score => !moment(score.date).isSame(moment(), 'day')),
          { date: moment().format('YYYY-MM-DD'), score: todayScore }
        ];
        
        // Add motivational notification on completion
        newState.notifications = [
          ...state.notifications,
          {
            id: uuidv4(),
            type: 'success',
            message: `Great job completing "${goalToToggle.title}"! ${getMotivationalQuote()}`,
            timestamp: new Date().toISOString(),
            read: false
          }
        ];
      }
      break;
      
    case 'ADD_HABIT':
      newState = {
        ...state,
        habits: [...state.habits, { 
          ...action.payload, 
          id: uuidv4(), 
          createdAt: new Date().toISOString(),
          streak: 0,
          history: []
        }],
        streaks: {
          ...state.streaks,
          habits: {
            ...state.streaks.habits,
            [action.payload.id]: 0
          }
        }
      };
      break;
      
    case 'UPDATE_HABIT':
      newState = {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === action.payload.id ? { ...habit, ...action.payload } : habit
        )
      };
      break;
      
    case 'DELETE_HABIT':
      const { [action.payload]: habitStreak, ...remainingHabitStreaks } = state.streaks.habits;
      newState = {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
        streaks: {
          ...state.streaks,
          habits: remainingHabitStreaks
        }
      };
      break;
      
    case 'TRACK_HABIT':
      const habitToTrack = state.habits.find(habit => habit.id === action.payload.habitId);
      const today = moment().format('YYYY-MM-DD');
      const wasCompletedToday = habitToTrack.history.some(entry => 
        moment(entry.date).isSame(today, 'day') && entry.completed
      );
      
      // If already completed today and trying to uncomplete
      if (wasCompletedToday && !action.payload.completed) {
        // Reduce streak
        const updatedHabitStreaks = {
          ...state.streaks.habits,
          [action.payload.habitId]: Math.max(0, state.streaks.habits[action.payload.habitId] - 1)
        };
        
        newState = {
          ...state,
          habits: state.habits.map(habit => 
            habit.id === action.payload.habitId 
              ? {
                  ...habit,
                  streak: Math.max(0, habit.streak - 1),
                  history: [
                    ...habit.history.filter(entry => !moment(entry.date).isSame(today, 'day')),
                    { date: today, completed: false }
                  ]
                }
              : habit
          ),
          streaks: {
            ...state.streaks,
            habits: updatedHabitStreaks
          }
        };
      } 
      // If not completed today and marking as completed
      else if (!wasCompletedToday && action.payload.completed) {
        // Increase streak
        const updatedHabitStreaks = {
          ...state.streaks.habits,
          [action.payload.habitId]: (state.streaks.habits[action.payload.habitId] || 0) + 1
        };
        
        newState = {
          ...state,
          habits: state.habits.map(habit => 
            habit.id === action.payload.habitId 
              ? {
                  ...habit,
                  streak: habit.streak + 1,
                  history: [
                    ...habit.history.filter(entry => !moment(entry.date).isSame(today, 'day')),
                    { date: today, completed: true }
                  ]
                }
              : habit
          ),
          streaks: {
            ...state.streaks,
            habits: updatedHabitStreaks
          },
          notifications: [
            ...state.notifications,
            {
              id: uuidv4(),
              type: 'success',
              message: `You've maintained a ${updatedHabitStreaks[action.payload.habitId]}-day streak for "${habitToTrack.title}"! ${getMotivationalQuote()}`,
              timestamp: new Date().toISOString(),
              read: false
            }
          ]
        };
      } 
      // Just updating the history without changing streak
      else {
        newState = {
          ...state,
          habits: state.habits.map(habit => 
            habit.id === action.payload.habitId 
              ? {
                  ...habit,
                  history: [
                    ...habit.history.filter(entry => !moment(entry.date).isSame(today, 'day')),
                    { date: today, completed: action.payload.completed }
                  ]
                }
              : habit
          )
        };
      }
      break;
      
    case 'TOGGLE_THEME':
      newState = {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
      break;
      
    case 'ADD_TAG':
      if (!state.tags.includes(action.payload)) {
        newState = {
          ...state,
          tags: [...state.tags, action.payload]
        };
      } else {
        return state;
      }
      break;
      
    case 'REMOVE_TAG':
      newState = {
        ...state,
        tags: state.tags.filter(tag => tag !== action.payload)
      };
      break;
      
    case 'MARK_NOTIFICATION_READ':
      newState = {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        )
      };
      break;
      
    case 'CLEAR_NOTIFICATIONS':
      newState = {
        ...state,
        notifications: []
      };
      break;
      
    default:
      return state;
  }
  
  // Save state to localStorage
  localStorage.setItem('todoTrackerState', JSON.stringify(newState));
  return newState;
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, loadState());
  
  // Check for missed days and reset streaks if necessary
  useEffect(() => {
    const checkStreaks = () => {
      const today = moment();
      const lastActivity = state.goals.reduce((latest, goal) => {
        if (goal.completedAt && moment(goal.completedAt).isAfter(latest)) {
          return moment(goal.completedAt);
        }
        return latest;
      }, moment('2000-01-01'));
      
      // If more than a day has passed since last activity, reset daily goal streak
      if (today.diff(lastActivity, 'days') > 1) {
        dispatch({ 
          type: 'RESET_STREAKS', 
          payload: { type: 'dailyGoals' } 
        });
      }
      
      // Check habit streaks
      state.habits.forEach(habit => {
        const lastCompletion = habit.history.reduce((latest, entry) => {
          if (entry.completed && moment(entry.date).isAfter(latest)) {
            return moment(entry.date);
          }
          return latest;
        }, moment('2000-01-01'));
        
        // If more than a day has passed since last completion, reset habit streak
        if (today.diff(lastCompletion, 'days') > 1) {
          dispatch({ 
            type: 'RESET_STREAKS', 
            payload: { type: 'habit', id: habit.id } 
          });
        }
      });
    };
    
    checkStreaks();
    
    // Set up daily check
    const intervalId = setInterval(checkStreaks, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(intervalId);
  }, [state.goals, state.habits]);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
