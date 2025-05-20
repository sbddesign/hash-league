import { HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onFaqClick: () => void;
}

export default function ActionButtons({ onFaqClick }: ActionButtonsProps) {
  const handleAddPoolClick = () => {
    window.open(
      "https://github.com/sbddesign/hash-league/issues/new?template=add-pool.md",
      "_blank",
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex gap-6 items-center">
      <Button
        onClick={onFaqClick}
        className="bg-[#00f3ff] text-black font-bold px-4 py-6 rounded-full flex items-center hover:bg-opacity-90 transition-all transform hover:scale-105"
      >
        <HelpCircle className="h-5 w-5 mr-0 md:mr-2" />
        <span className="hidden md:inline">FAQ</span>
      </Button>
      
      <Button
        onClick={handleAddPoolClick}
        className="bg-[#39FF14] text-black font-bold px-4 py-6 rounded-full flex items-center hover:bg-opacity-90 transition-all transform hover:scale-105"
      >
        <Plus className="h-5 w-5 mr-0 md:mr-2" />
        <span className="hidden md:inline">Add Your Pool</span>
      </Button>
    </div>
  );
}