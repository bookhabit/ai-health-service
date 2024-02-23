import Navbar from "@/components/Navbar";

export default function AppRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <div className="flex flex-col w-full h-full">
        <Navbar/>
        {children}    
    </div>
  );
}
