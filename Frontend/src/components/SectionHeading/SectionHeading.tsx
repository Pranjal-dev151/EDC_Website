import styles from './SectionHeading.module.css';

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
}

export default function SectionHeading({ eyebrow, title, description, id }: Props) {
  return (
    <div className={styles.heading} id={id}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
