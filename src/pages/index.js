import styles from "./index.module.css";

export default function HomePage() {
  return (
    <div
      className={` bg-black flex flex-col justify-center items-center w-full min-h-full pt-10 overflow-x-clip`}
    >
      {/* Here section */}
      <section
        id="hero"
        className={`${styles.bgBackground} flex items-center justify-between max-w-6xl w-full px-20 min-h-screen`}
      >
        {/* left section */}
        <div className="flex flex-col space-y-5 text-white text-left  font-manrope">
          <div className="max-w-md text-7xl font-semibold ">
            Welcome to CryptoKnights
          </div>
          <div className="max-w-lg text-3xl">
            Play Decentralised Chess on FlowChain,{" "}
            <span className={styles.textGradient}>
              Compete, Conquer, and Earn!
            </span>
          </div>

          {/* Button */}
          <div className="mt-10"></div>
          <button className="w-1/2 p-3 bg-[#7AD05B] rounded-xl text-black font-bold text-2xl">
            Get Started ....
          </button>
        </div>

        {/* right section */}
        <div className="relatve flex w-10 h-10">
          <div
            className={`${styles.purpleCloud} absolute -top-10 right-28 h-[30rem] w-[28rem]`}
          ></div>
          <img
            src="/imgs/logo.png"
            className="absolute top-16 right-14 z-10 h-[38rem]"
          ></img>
        </div>
      </section>

      {/* feature */}
      <section className="flex justify-center items-center w-full min-h-screen text-white bg-black pt-10 px-10">
        {/* Img */}
        <div className="relative w-[40rem] h-[40rem]">
          <div className="absolute top-32 right-40">
            <div className="flex relative items-center justify-center">
              <div
                className={`${styles.greenCircle} w-[40rem] h-[40rem] absolute`}
              ></div>
              <img
                src="/imgs/play-chess-your-way.png"
                alt=""
                className="z-10 w-[35rem]"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md font-space-grotesk font text-6xl text-left">
          Ultimate Platform for Multiplayer betting
        </div>
      </section>

      {/* feature 2*/}
      <section className="flex justify-center items-center w-full min-h-screen text-white bg-black px-10 ">
        {/* Content */}
        <div className="max-w-md font-space-grotesk font text-6xl text-left">
          Ultimate Platform for Multiplayer betting
        </div>

        {/* Img */}
        <div className="relative w-[40rem] h-[40rem] ">
          <div className="absolute top-32 left-40">
            <div className="flex relative items-center justify-center">
              <div
                className={`${styles.purpleCircle} w-[40rem] h-[40rem] absolute -right-[3.5rem]`}
              ></div>
              <img
                src="/imgs/chessBoardMultiplayerNew.png"
                alt=""
                className="z-10 w-[35rem]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* feature 3*/}
      <section className="flex justify-center items-center w-full min-h-screen text-white bg-black pb-40 px-10">
        {/* Img */}
        <div className="relative w-[40rem] h-[40rem]">
          <div className="absolute top-32 right-40">
            <div className="flex relative items-center justify-center">
              <div
                className={`${styles.orangeCircle} w-[40rem] h-[40rem] absolute`}
              ></div>
              <img
                src="/imgs/make-your-move.png"
                alt=""
                className="z-10 w-[35rem]"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md font-space-grotesk font text-6xl text-left">
          Ultimate Platform for Multiplayer betting
        </div>
      </section>

      <footer
        className={`${styles.blueGradientBg} w-full flex justify-center items-center text-white py-6 font-manrope font-semibold text-lg`}
      >
        Made with 💖 for the Web3 Community by Team CryptoKnights
      </footer>
    </div>
  );
}
