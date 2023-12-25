import styles from './countdown-timer.module.scss';
import { useEffect, useState } from 'react';

export interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  completeMessage?: string;
}

export function CountdownTimer(props: CountdownTimerProps) {
  const { completeMessage = 'Complete', title } = props;
  const [complete, setComplete] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = props.targetDate.getTime() - now.getTime();
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
      if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
        setComplete(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div>
      {complete ? (
        <div className={styles['timer-container']}>
          <div className={styles['timer-wrapper']}>
            <div className={styles['timer-inner']}>
              <h1 className={styles['timer-complete']}>{completeMessage}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles['timer-container']}>
          <div className={styles['timer-wrapper']}>
            <div className={styles['timer-title']}>{title}</div>
            <div className={styles['timer-inner']}>
              <div className={styles['timer-segment']}>
                <span className={styles['time']}>{days}</span>
                <span className={styles['label']}>Days</span>
              </div>
              <span className={styles['divider']}>:</span>
              <div className={styles['timer-segment']}>
                <span className={styles['time']}>{hours}</span>
                <span className={styles['label']}>Hours</span>
              </div>
              <span className={styles['divider']}>:</span>
              <div className={styles['timer-segment']}>
                <span className={styles['time']}>{minutes}</span>
                <span className={styles['label']}>Minutes</span>
              </div>
              <span className={styles['divider']}>:</span>
              <div className={styles['timer-segment']}>
                <span className={styles['time']}>{seconds}</span>
                <span className={styles['label']}>Seconds</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CountdownTimer;
