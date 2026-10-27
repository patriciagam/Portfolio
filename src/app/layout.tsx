import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/NavBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Patrícia Gameiro",
  description:
    "Software Systems Engineering Master's student at RWTH Aachen, interested in systems analysis, requirements engineering and modelling complex software systems.",
};

// Sets light/dark before first paint so there's no flash: the visitor's saved
// choice if they've used the toggle, otherwise their system setting (and it
// keeps following the system if that changes). The key must match
// THEME_STORAGE_KEY in ThemeToggle.
const themeScript = `(function(){
var root=document.documentElement,system=matchMedia("(prefers-color-scheme: light)");
function saved(){try{return localStorage.getItem("pg-theme")}catch(e){return null}}
function apply(){var mode=saved()||(system.matches?"light":"dark");if(mode==="light")root.dataset.mode="light";else delete root.dataset.mode}
apply();
system.addEventListener("change",function(){if(!saved())apply()});
})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
