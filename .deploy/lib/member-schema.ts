export interface MemberProfile {
  id: string;
  slug: string;
  
  // Basic Info
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  tagline?: string;
  
  // Contact
  phone?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    instagram?: string;
  };
  
  // Professional
  company?: string;
  jobTitle?: string;
  industry?: string;
  skills?: string[];
  
  // Location
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  
  // Media & Videos (Critical for VidiSmart)
  media?: {
    // Primary company/member video
    introVideo?: VideoAsset;
    // All videos uploaded by this member
    videos?: VideoAsset[];
    // Video playlist/categories
    playlists?: VideoPlaylist[];
    // Total video count
    totalVideos?: number;
    // Total views across all videos
    totalViews?: number;
    // Featured/hero video
    featuredVideo?: string; // video ID
  };
  
  // Community
  role: "navigator" | "coach" | "creator" | "member";
  interests?: string[];
  contributions?: number;
  joinedAt: string;
  lastActive?: string;
  
  // Preferences
  settings?: {
    newsletter: boolean;
    notifications: boolean;
    profilePublic: boolean;
  };
}

export interface VideoAsset {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  category?: string;
  tags?: string[];
  views?: number;
  likes?: number;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  durationFormatted?: string; // e.g., "12:34"
}

export interface VideoPlaylist {
  id: string;
  name: string;
  description?: string;
  videoIds: string[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
}

export const VIDEO_CATEGORIES = [
  "Tutorial",
  "Demo",
  "Showcase",
  "Interview",
  "Product Review",
  "Behind the Scenes",
  "Training",
  "Event Coverage",
  "Case Study",
  "Personal",
  "Other",
];

export const INDUSTRIES = [
  "Technology",
  "Film & Video",
  "Marketing & Advertising",
  "Education",
  "Gaming",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Art & Design",
  "Music",
  "Journalism",
  "Other",
];

export const SKILLS = [
  "Video Production",
  "AI/ML Engineering",
  "Web Development",
  "UI/UX Design",
  "Content Creation",
  "3D Modeling",
  "Motion Graphics",
  "Photography",
  "Copywriting",
  "Social Media",
  "SEO/SEM",
  "Data Analysis",
  "Project Management",
  "Community Building",
];

export const ROLES = [
  { value: "navigator", label: "Navigator", description: "Guide others through AI tools and workflows" },
  { value: "coach", label: "Coach", description: "Train and mentor creators in video production" },
  { value: "creator", label: "Creator", description: "Produce content for the VidiSmart community" },
  { value: "member", label: "Member", description: "Active community participant" },
];

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
