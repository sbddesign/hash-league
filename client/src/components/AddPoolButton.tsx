import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddPoolButton() {
  const handleClick = () => {
    window.open('https://github.com/hashleague/mining-pools/issues/new?template=add-pool.md', '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      className="pulse-animation fixed bottom-6 right-6 z-30 bg-[#39FF14] text-black font-bold px-4 py-6 rounded-full flex items-center hover:bg-opacity-90 transition-all transform hover:scale-105"
    >
      <Plus className="h-5 w-5 mr-0 md:mr-2" />
      <span className="hidden md:inline">Add Your Pool</span>
    </Button>
  );
}
