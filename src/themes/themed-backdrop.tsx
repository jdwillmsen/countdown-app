import type { CSSProperties, ReactNode } from 'react';
import styles from './themed-backdrop.module.scss';
import { themes, type ThemeName } from './themes';

export interface ThemedBackdropProps {
  theme: ThemeName;
  image?: string;
  children: ReactNode;
}

export function ThemedBackdrop({
  theme,
  image,
  children,
}: ThemedBackdropProps) {
  const { vars, backdrop } = themes[theme];
  const style = {
    ...vars,
    backgroundImage: image ? `url(${image})` : backdrop,
  } as CSSProperties;
  return (
    <div className={styles['backdrop']} style={style}>
      {children}
    </div>
  );
}

export default ThemedBackdrop;
