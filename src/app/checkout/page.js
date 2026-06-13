import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout | Pehnawa by Laxshmi",
  description: "Complete your order securely and continue your Pehnawa by Laxshmi shopping experience.",
  alternates: {
    canonical: "https://pehnawa.com/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Checkout | Pehnawa by Laxshmi",
    description: "Complete your order securely and continue your Pehnawa by Laxshmi shopping experience.",
    url: "https://pehnawa.com/checkout",
    siteName: "Pehnawa by Laxshmi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout | Pehnawa by Laxshmi",
    description: "Complete your order securely and continue your Pehnawa by Laxshmi shopping experience.",
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
