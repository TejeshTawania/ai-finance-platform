import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],

});

export const metadata = {
  title: "WelthWave",
  description: "One Stop Solution for all your financial needs",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html
      lang="en"
    >
      <body className="{inter.className}">
        <Header/>
        <main className = "min-h-screen pt-24">
        {children}
      </main>
      <Toaster richColors/>
      {/*footer */}
      <footer className=" bg-blue-200 py-12" >
        <div className="container mx-auto px-4 text-center text-grey-600">
          <p>Made By Tejesh Kumar Tawania</p>
        </div>
      </footer>

      </body>
    </html>
    </ClerkProvider>
  );
}
