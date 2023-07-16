'use client';

export default function GamePanel({ children }) {
  return (
    <div className="flex h-full w-full  justify-end text-white overflow-y-hidden">
      {children}

      <div className="hidden flex-col md:flex items-start md:min-w-[15%] py-16 px-8 gap-6 border-solid border-0 border-l-2 border-white">
        <div className="font-space-grotesk text-2xl pb-3">Invite Player</div>
        <div className="py-3 w-full text-center rounded-md text-black font-semibold bg-yellowGreen  hover:bg-[#83b34c] transition-all">
          Find Match
        </div>
        <input
          className="py-3 w-full text-center rounded-md font-space-grotesk font-bold bg-lightsteelblue"
          type="text"
          name="playerCode"
          placeholder="Enter Code"
        />
        {/* Join button */}
        <div className="flex w-full justify-end">
          <div className="py-2 px-5 rounded-md bg-[#4F458C] hover:scale-105 hover:bg-[#7869ce] transition-all">
            Join
          </div>
        </div>
      </div>
    </div>
  );
}
