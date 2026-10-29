import "./globals.css";

export const metadata = {
  title: "Livestock Time-Since-Death Estimator",
  description: "Educational rule-based livestock post-mortem interval estimator.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
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
