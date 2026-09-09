"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Camera, Check, Headphones, LampDesk, Leaf, Store, Tag, Users } from "lucide-react";
import styles from "./VendorInvitation.module.css";

const IDEAS = [
  { label: "Textbooks", icon: BookOpen, title: "Last semester's books", detail: "Your finished chapter. Someone else's fresh start.", tip: "Add the edition, subject, and a photo of the condition.", color: "#dbece3" },
  { label: "Electronics", icon: Headphones, title: "The gear you've outgrown", detail: "Make room for your next upgrade.", tip: "Include the model, accessories, and how well it works.", color: "#e6e2f2" },
  { label: "Room essentials", icon: LampDesk, title: "A little more room to live", detail: "Moving out? Help someone else settle in.", tip: "Share the size, condition, and a clear photo.", color: "#f8e3c6" },
];

export default function VendorInvitation({ href }: { href: string }) {
  const [selected, setSelected] = useState(0);
  const idea = IDEAS[selected];
  const ItemIcon = idea.icon;

  return (
    <section className={styles.section} aria-labelledby="vendor-invitation-title">
      <div className={styles.card}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}><Store size={15} aria-hidden="true" /> YOUR NEXT CHAPTER STARTS HERE</span>
          <h2 id="vendor-invitation-title">Less clutter.<br /><span>More possibilities.</span></h2>
          <p className={styles.intro}>Turn what you no longer need into a little extra for what comes next. Your old textbook, spare headphones, or desk lamp could be another student&apos;s perfect find.</p>
          <div className={styles.actions}>
            <Link href={href} className={styles.primary}>Become a Vendor <ArrowRight size={18} aria-hidden="true" /></Link>
            <a href="#start-selling" className={styles.secondary}>How it works <span aria-hidden="true">↗</span></a>
          </div>
          <p className={styles.reassurance}><Check size={15} aria-hidden="true" /> Start as an individual seller. No business needed.</p>
          <div className={styles.benefits}>
            <span><Tag size={17} aria-hidden="true" /> Your items, your price</span>
            <span><Users size={17} aria-hidden="true" /> Made for student life</span>
            <span><Leaf size={17} aria-hidden="true" /> Give good things a second life</span>
          </div>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewHeading}><span>WHAT COULD YOU SELL?</span><span className={styles.sparkle} aria-hidden="true">✦</span></div>
          <div className={styles.choices} role="group" aria-label="Explore first listing ideas">
            {IDEAS.map(({ label }, index) => (
              <button key={label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={selected === index ? styles.selected : undefined}>{label}</button>
            ))}
          </div>
          <div className={styles.listing} aria-live="polite" aria-atomic="true">
            <div className={styles.art} style={{ backgroundColor: idea.color }}>
              <span className={styles.example}>Your first listing could look like this</span>
              <div className={styles.itemIcon}><ItemIcon size={76} strokeWidth={1.25} aria-hidden="true" /></div>
              <span className={styles.photoNote}><Camera size={13} aria-hidden="true" /> Add your own photos</span>
            </div>
            <div className={styles.listingBody}>
              <span className={styles.category}>{idea.label} · Pre-loved</span>
              <h3>{idea.title}</h3>
              <p>{idea.detail}</p>
              <div className={styles.price}><span>You set the price</span><span className={styles.draft}>Your future listing</span></div>
            </div>
            <p className={styles.tip}><span>First-listing tip</span>{idea.tip}</p>
          </div>
        </div>

        <div id="start-selling" className={styles.steps}>
          <div className={styles.stepsIntro}><span>A SMALL START.</span><strong>A whole new possibility.</strong></div>
          <ol>
            <li><span className={styles.number}>01</span><div><strong>Create your shop</strong><p>Introduce yourself as a vendor.</p></div></li>
            <li><span className={styles.number}>02</span><div><strong>Make it yours</strong><p>Add photos, details, and your price.</p></div></li>
            <li><span className={styles.number}>03</span><div><strong>Give it a new home</strong><p>Help another student find their next essential.</p></div></li>
          </ol>
        </div>
      </div>
    </section>
  );
}
