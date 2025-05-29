/**
 * Collection of motivational quotes for productivity and goal achievement
 */
const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The way to get started is to quit talking and begin doing.",
  "It always seems impossible until it's done.",
  "You don't have to be great to start, but you have to start to be great.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "The only way to do great work is to love what you do.",
  "Your time is limited, don't waste it living someone else's life.",
  "The future depends on what you do today.",
  "Don't count the days, make the days count.",
  "You are never too old to set another goal or to dream a new dream.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dreams don't work unless you do.",
  "Success is liking yourself, liking what you do, and liking how you do it.",
  "The difference between ordinary and extraordinary is that little extra.",
  "The best way to predict the future is to create it.",
  "Small progress is still progress.",
  "Focus on being productive instead of busy.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "You don't need to see the whole staircase, just take the first step.",
  "The key to success is to focus on goals, not obstacles.",
  "Don't wait for opportunity. Create it.",
  "Success is walking from failure to failure with no loss of enthusiasm.",
  "The only place where success comes before work is in the dictionary.",
  "Your attitude determines your direction.",
  "The harder you fall, the higher you bounce.",
  "Productivity is never an accident. It is always the result of a commitment to excellence.",
  "The only way to do great work is to love what you do.",
  "You miss 100% of the shots you don't take."
];

/**
 * Get a random motivational quote from the collection
 * 
 * @returns {String} - A random motivational quote
 */
export const getMotivationalQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

/**
 * Get a specific quote based on an index or situation
 * 
 * @param {Number} index - Index of the quote to retrieve
 * @returns {String} - The requested motivational quote
 */
export const getSpecificQuote = (index) => {
  // Ensure index is within bounds
  const safeIndex = Math.max(0, Math.min(index, motivationalQuotes.length - 1));
  return motivationalQuotes[safeIndex];
};

/**
 * Get a contextual quote based on the user's current productivity situation
 * 
 * @param {String} context - The context for which to get a quote (e.g., 'streak', 'completed', 'started')
 * @returns {String} - A contextually appropriate motivational quote
 */
export const getContextualQuote = (context) => {
  // Quotes particularly good for streaks
  const streakQuotes = [
    "Consistency is the key to achieving results!",
    "Your streak is building momentum. Keep it going!",
    "Small daily improvements lead to stunning results.",
    "Success isn't always about greatness. It's about consistency.",
    "The secret of your future is hidden in your daily routine."
  ];
  
  // Quotes for completing difficult tasks
  const completionQuotes = [
    "The harder the battle, the sweeter the victory.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "The difference between try and triumph is just a little umph!",
    "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    "The feeling of accomplishment is one of the greatest feelings you'll ever experience."
  ];
  
  // Quotes for starting new goals
  const startingQuotes = [
    "The beginning is the most important part of the work.",
    "Start where you are. Use what you have. Do what you can.",
    "Every accomplishment starts with the decision to try.",
    "The journey of a thousand miles begins with a single step.",
    "Don't be afraid to start over. It's a chance to build something better this time."
  ];
  
  // Select appropriate quote set based on context
  let contextQuotes;
  switch (context) {
    case 'streak':
      contextQuotes = streakQuotes;
      break;
    case 'completed':
      contextQuotes = completionQuotes;
      break;
    case 'started':
      contextQuotes = startingQuotes;
      break;
    default:
      return getMotivationalQuote();
  }
  
  // Return random quote from the selected context
  const randomIndex = Math.floor(Math.random() * contextQuotes.length);
  return contextQuotes[randomIndex];
};
