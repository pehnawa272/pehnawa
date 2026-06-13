import HomepageClient from "./HomepageClient";

export const metadata = {
  title: "Pehnawa by Laxshmi | Desi Vibes Modern Soul",
  description: "Handcrafted Indian ethnic wear blending timeless elegance with modern silhouettes. Discover everyday elegance, festive luxury, and the Golden Era collection at Pehnawa by Laxshmi.",
  alternates: {
    canonical: "https://pehnawa.com",
  },
  openGraph: {
    title: "Pehnawa by Laxshmi | Desi Vibes Modern Soul",
    description: "Handcrafted Indian ethnic wear blending timeless elegance with modern silhouettes. Discover everyday elegance, festive luxury, and the Golden Era collection at Pehnawa by Laxshmi.",
    url: "https://pehnawa.com",
    siteName: "Pehnawa by Laxshmi",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRYEOYWIZRsGva4IyXBVIXs7CfoX2rPRXpycmyOA1Eksu-SfYR3SL_iooS3VJQugWuEHy2R2oqJqyK-lWCXZNHM1f7zBTxhEcsNwNsKjr_OSom7KYkcpYjFsG5zwkQBkXpE34EqWv4ndiCjuihfJ6EY0-yJjo1NkMgbG-zdmAUj4Uwd7vvciks9yZrL3HnQwlmrNOy-8twHHXVohLYOhf2OOBSeNcVxnGXRbPDTA5egSKLxQtRjSVjklLZCKGT-5SjAgJlfo1iuiE",
        width: 1200,
        height: 630,
        alt: "Pehnawa by Laxshmi Luxury Indian Couture",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pehnawa by Laxshmi | Desi Vibes Modern Soul",
    description: "Handcrafted Indian ethnic wear blending timeless elegance with modern silhouettes. Discover everyday elegance, festive luxury, and the Golden Era collection at Pehnawa by Laxshmi.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDRYEOYWIZRsGva4IyXBVIXs7CfoX2rPRXpycmyOA1Eksu-SfYR3SL_iooS3VJQugWuEHy2R2oqJqyK-lWCXZNHM1f7zBTxhEcsNwNsKjr_OSom7KYkcpYjFsG5zwkQBkXpE34EqWv4ndiCjuihfJ6EY0-yJjo1NkMgbG-zdmAUj4Uwd7vvciks9yZrL3HnQwlmrNOy-8twHHXVohLYOhf2OOBSeNcVxnGXRbPDTA5egSKLxQtRjSVjklLZCKGT-5SjAgJlfo1iuiE"],
  },
};

export default function Homepage() {
  return <HomepageClient />;
}
