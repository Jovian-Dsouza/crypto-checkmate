'use client';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { useSelectedLayoutSegment } from 'next/navigation';
import { menuList } from '@/utils/data';
import { useContext, useEffect, useMemo } from 'react';
import { AppContext } from '@/AppContext';
import { useRouter } from 'next/navigation';
import * as fcl from '@onflow/fcl';

export default function Sidebar({ children }) {
  const layoutSegment = useSelectedLayoutSegment();
  const segment = `/dashboard/${layoutSegment}`;
  const { user } = useContext(AppContext);
  const router = useRouter();
  const address = useMemo(() => (user.addr ? user.addr.slice(0, 10) + '...' : ''), [user]);

  function handleLogout() {
    fcl.unauthenticate();
  }

  return (
    <div className="flex h-full w-full text-white overflow-y-hidden">
      {/* Side Nav bar */}
      <div className="hidden flex-col md:flex md:min-w-[15%] justify-between py-16 px-8 border-solid border-0 border-r-2 border-white">
        {/* Menu List */}
        <div className="flex flex-col space-y-4">
          {menuList.map((item, index) => (
            <Link
              className={`flex items-center py-3 px-5 gap-2 rounded-xl text-black no-underline ${
                item.link.includes(segment) ? styles.menuGradientSelected : styles.menuGradient
              }`}
              key={index}
              href={item.link}
            >
              <img src={`/icons/${item.icon}`} alt={item.title} className="w-5" />
              <span className="font-manrope font-[600] text-sm">{item.title}</span>
            </Link>
          ))}
        </div>

        {/* Wallet */}
        <div className="flex flex-col px-3 rounded-lg bg-lavender-300 border border-gray-500 border-solid shadow-lg shadow-gray-600 mt-5">
          {/* Upper part */}
          <div className="flex py-1.5 justify-between items-center border-0 border-b border-gray-600 border-solid">
            {/* profile logo and address */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-red-600`}></div>
              <div className="flex flex-col space-y- font-space-grotesk">
                <div className="text-sm text-whitesmoke ">User</div>
                <div className="text-xs text-ghostwhite">{address}</div>
              </div>
            </div>
            {/* chevron right */}
            <div
              onClick={handleLogout}
              className="flex items-center justify-center rounded-full bg-lavender-100 w-7 h-7 hover:bg-slate-700"
            >
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

      {children}
    </div>
  );
}
