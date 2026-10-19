import Link from "next/link";
import { ArrowRight, BookOpen, House, ShoppingBag, Users } from "lucide-react";
import styles from "./CampusLifePanel.module.css";

const BENEFITS = [
  { icon: BookOpen, title: "Learn your way", detail: "Kuppi sessions, assignments, and exam help." },
  { icon: Users, title: "Study together", detail: "Connect with students who share your goals." },
  { icon: ShoppingBag, title: "Earn & save", detail: "Teach, sell essentials, and find student deals." },
  { icon: House, title: "Feel at home", detail: "Find boarding near your university." },
];

export default function CampusLifePanel() {
  return (
    <section className={styles.section} aria-labelledby="campus-life-title">
      <div className={styles.panel}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Made for campus life</span>
          <h2 id="campus-life-title">Your student life.<br />A little simpler.</h2>
          <p className={styles.description}>From your next exam to your next place to stay, UniHub brings your campus essentials together.</p>
          <ul className={styles.benefits}>
            {BENEFITS.map(({ icon: Icon, title, detail }) => (
              <li key={title}>
                <span className={styles.icon}><Icon size={18} aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{detail}</p></div>
              </li>
            ))}
          </ul>
          <Link href="/courses" className={styles.action}>Find your next kuppi <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>

        <div className={styles.collage}>
          <figure className={styles.campus}>
            <img src="/campus-walkway.png" alt="University students walking together on a Sri Lankan campus" loading="lazy" />
            <figcaption>Find your people.</figcaption>
          </figure>
          <figure className={styles.study}>
            <img src="/library-study-group.png" alt="Students learning together in a study group" loading="lazy" />
            <figcaption>Learn together.</figcaption>
          </figure>
          <div className={styles.essentials}>
            <figure className={styles.marketplace}>
              <div className={styles.picture} role="img" aria-label="Books, a calculator, headphones, and a student backpack" />
              <figcaption>Make it yours.</figcaption>
            </figure>
            <figure className={styles.boarding}>
              <div className={styles.picture} role="img" aria-label="A welcoming student room with a bed and study desk" />
              <figcaption>Settle in.</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
