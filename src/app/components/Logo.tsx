import React from 'react';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <svg
        className="w-8 h-8 text-blue-600 dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 19l-2-2m0 0l2-2m-2 2h16m-16 0l2 2m-2-2l2-2m9 2h3m-3-6h3m-3 6v-6m0 0l-3-3m3 3l3-3"
        />
      </svg>
      <span className="text-xl font-bold text-gray-800 dark:text-white">
        FlyNext
      </span>
    </Link>
  );
};

export default Logo;