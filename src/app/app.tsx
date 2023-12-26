import styles from './app.module.scss';
import CountdownTimer from './countdown-timer/countdown-timer';
import background from '../assets/camp_background.webp';

export function App() {
  const boysWeekendDate = new Date('07/18/2024 18:00:00');
  return (
    <div
      className={styles['container']}
      style={{
        backgroundImage: `url(${background}`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <CountdownTimer
        title={'Boys Weekend Countdown'}
        targetDate={boysWeekendDate}
        completeMessage={'Boys Weekend Is Here!'}
      />
    </div>
  );
}

export default App;
