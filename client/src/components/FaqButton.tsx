import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaqButtonProps {
  onClick: () => void;
}

export default function FaqButton({ onClick }: FaqButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-[5.5rem] md:right-28 z-30 bg-[#00f3ff] text-black font-bold px-4 py-6 rounded-full flex items-center hover:bg-opacity-90 transition-all transform hover:scale-105"
    >
      <HelpCircle className="h-5 w-5 mr-0 md:mr-2" />
      <span className="hidden md:inline">FAQ</span>
    </Button>
  );
}