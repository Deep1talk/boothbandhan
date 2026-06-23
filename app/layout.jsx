import GlobalProvider from "@/components/shared/providers/GlobalProvider";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Assistant } from "next/font/google";

const AssistantFont = Assistant({
  subsets: ["latin"],
  fontWeight: ["400", "500", "600", "700"],
}) // make sure to include the font weights you intend to use

export const metadata = {
  title: "बूथ बंधन",
  description: "बूथ बंधन पॉलिटिकल कंसल्टेंसी",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${AssistantFont.className} dark`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
