import GamePanel from '@/app/dashboard/arena/GamePanel';

export default function ArenaLayout({ children }) {
  return (
    <div className="flex flex-col w-full h-screen">
      <GamePanel>{children}</GamePanel>
    </div>
  );
}
