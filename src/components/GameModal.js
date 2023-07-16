import styles from '@/components/modal.module.css';

export function GameModal({ heading, status, btnText, btnStyle, show }) {
  return (
    <div
      className={`${
        show ? 'fixed' : 'hidden'
      }  z-50 flex flex-col text-white font-mono font-bold justify-start items-center px-3 py-4 w-80 rounded-2xl bg-[#5C6DE0] ${
        styles.outerBox
      } gap-2`}
    >
      <div className="text-2xl capitalize">{heading}</div>

      <div className="flex flex-col justify-center items-center w-full py-7 bg-[#38469E] rounded-md gap-5">
        <div className="text-2xl capitalize">{status}</div>
        <div
          className={`flex justify-center rounded-full py-1 w-64 text-2xl font-manrope font-bold bg-[#FF1102]   transition hover:bg-[#ab2016] duration-150 border-black border-3 border-solid shadow-lg ${btnStyle}`}
        >
          {btnText}
        </div>
      </div>
    </div>
  );
}
