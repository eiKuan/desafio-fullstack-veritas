import { ReactNode } from "react";
import backgroundImage from "../assets/backgroundImage.png";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(114, 24, 13, 0.3) 0%, rgba(10, 10, 10, 0.6) 70%)",
        }}
      />
      <div className="relative h-full w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
