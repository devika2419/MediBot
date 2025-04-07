import "../app/global.css";

export const metadata = {
  title: "MediBot",
  description: "Go to chatbot for health related queries",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
