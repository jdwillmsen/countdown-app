import styles from './app.module.scss';
import CountdownTimer from './countdown-timer/countdown-timer';
import { ThemedBackdrop } from '../themes/themed-backdrop';
import background from '../assets/camp_background.webp';

export function App() {
  const boysWeekendDate = new Date('07/17/2025 16:30:00');
  const version = import.meta.env.VITE_APP_VERSION;
  return (
    <ThemedBackdrop theme="camp" image={background}>
      <CountdownTimer
        title={'Boys Weekend Countdown'}
        targetDate={boysWeekendDate}
        completeMessage={'Boys Weekend Is Here!'}
      />
      {version && <small className={styles['version']}>v{version}</small>}
    </ThemedBackdrop>
  );
}

export default App;
