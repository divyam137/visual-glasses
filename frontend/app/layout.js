import "./globals.css";
import GridBackground from "../components/UI/GridBackground";
import Header from "@/components/UI/Header";
import Footer from "@/components/UI/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className=" min-h-screen flex flex-col">

        {/* background grid */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <GridBackground />
        </div>

        {/* top navigation */}
        <Header />

        {/* page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* footer */}
        <Footer />
      </body>
    </html>
  );
}
