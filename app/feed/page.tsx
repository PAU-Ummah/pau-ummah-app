import { MediaFeed } from "@/components/feed/MediaFeed";
import { Metadata } from "next";

// Remove revalidate to avoid async storage issues
// export const revalidate = 60;

export const metadata: Metadata = {
  title: "Media Feed - Pan Atlantic University Mosque",
  description: "Browse through inspiring moments from our community events and programmes",
};

export default function FeedPage() {
  return <MediaFeed />;
}