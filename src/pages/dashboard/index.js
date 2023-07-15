import styles from './dashboard.module.css';

export default function Dashboard() {
  const menuList = [
    { title: 'Home', link: 'home.svg' },
    { title: 'Chess Arena', link: 'Vector.svg' },
    { title: 'Tournaments', link: 'calendar.svg' },
    { title: 'Marketplace', link: 'building-store.svg' },
    { title: 'Account', link: 'wallet.svg' },
  ];

  return (
    <div className="flex flex-col w-full h-screen bg-[#011226]">
      {/* Header */}
      <div className="flex items-center gap-2 bg-seagreen px-10 py-1">
        {/* logo */}
        <img src="/imgs/logo.png" className="h-10"></img>
        {/* Brankd Name */}
        <div className="text-black text-2xl font-manrope font-bold">ChecKnights</div>
      </div>

      {/* body */}
      <div className="flex h-full w-full text-white">
        {/* Side Nav bar */}
        <div className="hidden flex-col md:flex md:min-w-[15%] justify-between py-16 px-8 border-solid border-0 border-r-2 border-white">
          {/* Menu List */}
          <div className="flex flex-col space-y-4">
            {menuList.map((item, index) => (
              <div
                className={`flex items-center py-3 px-5 gap-2 rounded-xl text-black ${styles.menuGradient}`}
                key={index}
              >
                <img src={`/icons/${item.link}`} alt={item.title} className="w-5" />
                <span className="font-manrope font-[600] text-sm">{item.title}</span>
              </div>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex flex-col px-3 rounded-lg bg-lavender-300 border border-gray-500 border-solid shadow-lg shadow-gray-600">
            {/* Upper part */}
            <div className="flex py-1.5 justify-between items-center border-0 border-b border-gray-600 border-solid">
              {/* profile logo and address */}
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-red-600`}></div>
                <div className="flex flex-col space-y- font-space-grotesk">
                  <div className="text-sm text-whitesmoke ">Email</div>
                  <div className="text-xs text-ghostwhite">Address</div>
                </div>
              </div>
              {/* chevron right */}
              <div className="flex items-center justify-center rounded-full bg-lavender-100 w-7 h-7 hover:bg-slate-700">
                <img
                  src="/icons/chevron-right.svg"
                  alt="right"
                  className="transform hover:scale-110 transition duration-300"
                />
              </div>
            </div>
            {/* Lower part */}
            <div className="flex items-center py-1">
              <img src="/icons/wallet-gray.svg" alt="wallet-icon" className="text-gray mr-5" />
              <img src="/imgs/flow.png" alt="flow-icon" className="w-6 h-6 mr-2" />
              <div>0</div>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="flex w-full px-10 py-10 text-5xl font-manrope">Dashboard</div>
      </div>
    </div>
  );
}
