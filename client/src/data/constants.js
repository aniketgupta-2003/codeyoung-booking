import { Users, Laptop, CalendarDays } from "lucide-react";

export const API_URL = "http://localhost:5000";

export const timeZones = [
  { label: "United Kingdom (London)", value: "Europe/London" },
  { label: "United States (New York)", value: "America/New_York" },
  { label: "United States (Los Angeles)", value: "America/Los_Angeles" },
  { label: "India (Kolkata)", value: "Asia/Kolkata" },
  { label: "United States (Chicago)", value: "America/Chicago" },
];

export const initialForm = {
  parentName: "",
  parentEmail: "",
  parentTimeZone: "Europe/London",
  localStartTime: "",
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Programs", href: "#programs" },
  { label: "Why Codeyoung", href: "#why" },
  { label: "Contact", href: "#contact" },
];

export const features = [
  {
    icon: Users,
    title: "1:1 with Expert Mentors",
    text: "Learn from experienced and friendly mentors.",
    tint: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Laptop,
    title: "Personalised Learning",
    text: "Curriculum tailored to your child's interests and pace.",
    tint: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: CalendarDays,
    title: "Flexible Scheduling",
    text: "Convenient time slots across multiple time zones.",
    tint: "bg-blue-100 text-blue-600",
  },
];

export const stats = [
  { value: "10+", label: "Expert Mentors" },
  { value: "30 min", label: "Free Trial Class" },
  { value: "1000+", label: "Happy Students" },
];
