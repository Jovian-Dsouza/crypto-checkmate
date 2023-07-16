'use client';
import styles from '@/app/dashboard/dashboard.module.css';
import GameCard from '@/app/dashboard/GameCard';

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full px-14 py-10 font-space-grotesk space-y-6">
      {/* Heading */}
      <div className="text-3xl font-500">User Dashboard</div>
      {/* Game type */}

      <div className="flex flex-col space-y-5 z-10 bg-gray-200">
        <div className="text-xl font-300">Start your game ...</div>
        <div className="div flex flex-col md:flex-row w-full md:justify-between gap-5">
          {/* Card1 */}
          <GameCard className={styles.card1Bg} btnName="Play Now" cardTitle="Standard Match">
            <div className="text-center text-xs text-ghostwhite max-w-[15rem]">
              This Combat match is between your beloved friends or Random mates
            </div>
          </GameCard>

          {/* Card2 */}
          <GameCard className={styles.card2Bg} btnName="Play Now" cardTitle="Betting Match">
            <div className="text-center text-xs text-ghostwhite max-w-[15rem]">
              Stake Flow and Bet with your friends , Random mates for Ultimate winnings
            </div>
          </GameCard>

          {/* Card3 */}
          <GameCard className={styles.card3Bg} btnName="Play Now" cardTitle="You Vs Ai">
            <div className="text-center text-xs text-ghostwhite max-w-[15rem]">
              This game is for your practice and have no affect on Your Ratings.
            </div>
          </GameCard>
        </div>
      </div>

      <div className="flex flex-col space-y-5">
        <div className="text-xl font-300">Game Analysis</div>
        <div className="div flex w-full space-x-10">
          {/* Rating Card */}
          <div className="flex flex-col border border-solid border-lightsteelblue py-2 bg-lavender-300 rounded-xl">
            <div className="flex items-center space-x-1 px-3">
              <img src="/icons/activity.svg"  />
              <div className="text-sm font-500">Rating</div>
            </div>
            <div className="flex items-center justify-center text-5xl font-bold px-10 py-10">1200</div>
          </div>

          {/* Rewards Card */}
          <div className="flex flex-col border border-solid border-lightsteelblue py-2 bg-lavender-300 rounded-xl">
            <div className="flex items-center space-x-1 px-3">
              <img src="/icons/activity.svg"  />
              <div className="text-sm font-500">Rewards</div>
            </div>
            <div className="flex items-center justify-center text-5xl font-bold px-10 py-10">$150</div>
          </div>
        </div>
      </div>

      <div className='absolute bottom-0 right-0 hidden xl:block'>
        <img src="/imgs/spiral.png" className="w-80 " />
      </div>
    </div>
  );
}
