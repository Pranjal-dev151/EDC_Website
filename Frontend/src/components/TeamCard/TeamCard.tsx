import type { TeamMember } from '../../types';
import styles from './TeamCard.module.css';

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className={styles.card}>
      <div className={styles.photoWrap}>
        <img src={member.photo.src} srcSet={member.photo.srcSet} sizes={member.photo.sizes} alt={member.photo.alt} width={member.photo.width} height={member.photo.height} loading="lazy" />
      </div>
      <div className={styles.body}>
        <h3>{member.name}</h3>
        <p className={styles.role}>{member.role} · {member.department}</p>
        {member.email && <a className={styles.email} href={`mailto:${member.email}`}>{member.email}</a>}
        {member.socials && member.socials.length > 0 && (
          <div className={styles.socials}>
            {member.socials.map((s) => <a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>)}
          </div>
        )}
      </div>
    </article>
  );
}
