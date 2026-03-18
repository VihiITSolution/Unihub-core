"use client";

import ComingSoonPage from "@/components/ComingSoonPage";

export default function BoardingPage() {
  const handleEmailSubmit = async (email: string) => {
    // TODO: Save email to database for notifications
    console.log("Email for boarding notifications:", email);
  };

  return (
    <ComingSoonPage
      title="Boarding Marketplace"
      description="Find and list boarding accommodations near your university. Connect with students and landlords to discover your perfect home away from home."
      onEmailSubmit={handleEmailSubmit}
    />
  );
}
