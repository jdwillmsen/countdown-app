import styles from './countdown-timer.module.scss';
import { useEffect, useState } from 'react';

export interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  completeMessage?: string;
  date?: string;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function CountdownTimer(props: CountdownTimerProps) {
  const { completeMessage = 'Complete', title, date } = props;
  const target = props.targetDate.getTime();
  // Read the clock during the first render so the page never flashes 0:0:0:0
  // while waiting for the first interval tick.
  const [now, setNow] = useState(() => Date.now());
  const done = now >= target;

  // Once the target has passed the display never changes again, so there is
  // nothing left for the interval to refresh; leaving it running would tick
  // forever on an unmounted-in-spirit but still-rendered complete screen.
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(interval);
  }, [target, done]);

  const remaining = target - now;
  const dateLine = date && <div className={styles['timer-date']}>{date}</div>;

  if (remaining <= 0) {
    return (
      <div className={styles['timer-container']}>
        <div className={styles['timer-wrapper']}>
          <div className={styles['timer-inner']}>
            <h1 className={styles['timer-complete']}>{completeMessage}</h1>
          </div>
          {dateLine}
        </div>
      </div>
    );
  }

  const segments = [
    ['Days', Math.floor(remaining / DAY)],
    ['Hours', Math.floor((remaining % DAY) / HOUR)],
    ['Minutes', Math.floor((remaining % HOUR) / MINUTE)],
    ['Seconds', Math.floor((remaining % MINUTE) / SECOND)],
  ] as const;

  return (
    <div className={styles['timer-container']}>
      <div className={styles['timer-wrapper']}>
        <div className={styles['timer-title']}>{title}</div>
        <div className={styles['timer-inner']}>
          {segments.map(([label, value], i) => (
            <div key={label} style={{ display: 'contents' }}>
              {i > 0 && <span className={styles['divider']}>:</span>}
              <div className={styles['timer-segment']}>
                <span className={styles['time']}>{value}</span>
                <span className={styles['label']}>{label}</span>
              </div>
            </div>
          ))}
        </div>
        {dateLine}
      </div>
    </div>
  );
}

export default CountdownTimer;
