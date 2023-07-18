import Link from 'next/link';

export default function GameCard({ children, className, btnName, href, cardTitle }) {
  return (
    <div className={`flex flex-col justify-center items-center rounded-2xl px-10 py-3 ${className}`}>
      <img src="/imgs/chessIcon.png" className="w-28" />
      <div className="text-2xl text-whitesmoke font-bold text-white-smoke mt-4">{cardTitle}</div>
      {children}
      <Link
        href={href? href: "/"}
        className="flex items-center-justify-center px-4 py-2 mt-4 bg-whitesmoke rounded-md text-black font-bold hover:bg-slate-700 hover:text-whitesmoke"
      >
        {btnName}
      </Link>
    </div>
  );
}
