import "./globals.css";

export const metadata = {
  title: "Livestock Time-Since-Death Estimator",
  description: "Educational rule-based livestock post-mortem interval estimator.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png"
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Livestock TOD" }
};

export const viewport = {
  themeColor: "#1f6f4a"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
