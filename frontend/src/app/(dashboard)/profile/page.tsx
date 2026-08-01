import React from "react";
import { ProfileView } from "@/features/profile/ProfileView";

export default function ProfilePage() {
  return (
    <div className="min-h-full">
      <ProfileView githubUsername="arpitrajput11" leetcodeUsername="arpitrajput11" />
    </div>
  );
}
