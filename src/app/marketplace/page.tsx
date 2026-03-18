"use client";

import ComingSoonPage from "@/components/ComingSoonPage";

export default function MarketplacePage() {
  const handleEmailSubmit = async (email: string) => {
    // TODO: Save email to database for notifications
    console.log("Email for marketplace notifications:", email);
  };

  return (
    <ComingSoonPage
      title="UniHub Marketplace"
      description="Buy, sell, and trade items with other students. From textbooks to electronics, find everything you need to enhance your university experience."
      onEmailSubmit={handleEmailSubmit}
    />
  );
}
