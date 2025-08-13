# SlotMachineScore Component Documentation

## Overview
`SlotMachineScore` is a React component that displays numeric scores with a slot machine animation effect. It wraps the `react-slot-counter` library to provide a visually appealing way to show changing score values across the application.

## Recent Changes

1. **Display Formatting**
   - Removed comma separators from numbers
   - Eliminated leading zeros for all numeric values
   - Implemented proper number formatting using `.toString()`

2. **Visual Improvements**
   - Fixed issues with digits being cut off or improperly displayed
   - Enhanced CSS with better spacing, alignment, and visibility
   - Added proper container styling with improved margins and padding
   - Set `slotPeek` to 0 to prevent peeking of adjacent digits
   - Optimized animation speed and duration (2 seconds default)

3. **Animation Control**
   - Added `onAnimationComplete` callback functionality
   - Implemented animation delay and proper cleanup
   - Set up proper sequential animation mode for logical transitions

## Integration Guide for Backend Developers

### Basic Usage
The component accepts a numeric value and animates transitions between values:

```jsx
<SlotMachineScore 
  value={userScore} 
  duration={2} 
  showAnimation={true} 
  onAnimationComplete={() => console.log('Animation finished')}
/>
```

### API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | (required) | The numeric score to display |
| `duration` | number | 2 | Animation duration in seconds |
| `className` | string | "" | Additional CSS classes |
| `showAnimation` | boolean | true | Whether to animate or instantly show |
| `onAnimationComplete` | function | undefined | Callback after animation completes |

### Backend Integration Patterns

#### 1. Real-time Score Updates
For real-time score updates (like websocket data):

```typescript
// In your component that receives backend data
const [score, setScore] = useState(0);

useEffect(() => {
  // Set up websocket or data subscription
  const socket = connectToScoreWebsocket();
  
  socket.onmessage = (event) => {
    const newScore = JSON.parse(event.data).score;
    setScore(newScore); // SlotMachineScore will automatically animate the change
  };
  
  return () => socket.close();
}, []);
```

#### 2. API Response Integration
For scores fetched from REST APIs:

```typescript
const [score, setScore] = useState(0);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function fetchScore() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/score');
      const data = await response.json();
      setScore(data.score);
    } catch (error) {
      console.error('Failed to fetch score:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  fetchScore();
  // Set up polling if needed
  const interval = setInterval(fetchScore, 30000); // every 30 seconds
  return () => clearInterval(interval);
}, []);

return (
  <>
    {isLoading ? (
      <LoadingSpinner />
    ) : (
      <SlotMachineScore value={score} />
    )}
  </>
);
```

#### 3. Calculating Scores
If the backend sends raw data that needs to be calculated into a score:

```typescript
// Example of processing backend data into a score
function calculateScore(userData) {
  let score = 0;
  
  // Apply your scoring logic
  score += userData.completedTasks * 10;
  score += userData.achievements.length * 50;
  score -= userData.penalties * 5;
  
  return score;
}

// In your component
const [userData, setUserData] = useState(null);
const [calculatedScore, setCalculatedScore] = useState(0);

useEffect(() => {
  if (userData) {
    const score = calculateScore(userData);
    setCalculatedScore(score);
  }
}, [userData]);
```

#### 4. Handling Score Transitions
For multi-step processes that update scores incrementally:

```typescript
const [currentStep, setCurrentStep] = useState(0);
const [score, setScore] = useState(0);
const [animationComplete, setAnimationComplete] = useState(true);

const startNextStep = () => {
  if (animationComplete && currentStep < steps.length - 1) {
    setAnimationComplete(false);
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setScore(steps[nextStep].score);
  }
};

return (
  <div>
    <SlotMachineScore 
      value={score} 
      onAnimationComplete={() => setAnimationComplete(true)}
    />
    <button 
      onClick={startNextStep}
      disabled={!animationComplete || currentStep === steps.length - 1}
    >
      Next Step
    </button>
  </div>
);
```

## Implementation Details

The component uses the `react-slot-counter` library with customized styling and behavior. The animation shows digits scrolling upward to reach the final value, similar to a slot machine.

Key implementation details:
- Values are formatted without commas or leading zeros
- Sequential animation mode ensures logical number transitions
- MonospaceWidth ensures consistent digit widths
- Custom CSS controls the visual appearance and animation effects

## Performance Considerations

- Animation occurs on the client side with minimal server impact
- Consider throttling frequent backend updates to prevent UI jank
- For very large numbers, keep an eye on performance impact 