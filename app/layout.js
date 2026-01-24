import "./globals.css";

export const metadata = {
  title: "AlumniConnect",
  description: "Multi-college alumni networking and jobs platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
