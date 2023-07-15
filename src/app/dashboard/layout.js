import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <div className="flex flex-col w-full h-screen bg-[#011226]">
        {/* Header -> Logo and brand name*/}
        <div className="flex items-center gap-2 bg-seagreen px-10 py-1">
          <img src="/imgs/logo.png" className="h-10"></img>
          <div className="text-black text-2xl font-manrope font-bold">ChecKnights</div>
        </div>
        <Sidebar>{children}</Sidebar>
      </div>
    </div>
  );
}
