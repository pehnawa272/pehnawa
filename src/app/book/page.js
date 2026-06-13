import BookConsultationClient from "./BookConsultationClient";

export const metadata = {
  title: "Book a Styling Consultation | Pehnawa by Laxshmi",
  description: "Get personalized styling advice, custom tailoring support, and expert guidance from the Pehnawa by Laxshmi team.",
  alternates: {
    canonical: "https://pehnawa.com/book",
  },
  openGraph: {
    title: "Book a Styling Consultation | Pehnawa by Laxshmi",
    description: "Get personalized styling advice, custom tailoring support, and expert guidance from the Pehnawa by Laxshmi team.",
    url: "https://pehnawa.com/book",
    siteName: "Pehnawa by Laxshmi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Styling Consultation | Pehnawa by Laxshmi",
    description: "Get personalized styling advice, custom tailoring support, and expert guidance from the Pehnawa by Laxshmi team.",
  },
};

import { redirect } from "next/navigation";

export default function BookConsultationPage() {
  redirect("https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20would%20like%20to%20book%20a%20styling%20consultation.");
}
