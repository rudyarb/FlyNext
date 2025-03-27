import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {/* Replace with FlyNext logo */}
        <Image
          className="dark:invert"
          src="/./logo.jpg" // Make sure you have your logo here
          alt="FlyNext Logo"
          width={180}
          height={38}
          priority
        />
        
        {/* Welcome text */}
        <h1 className="text-4xl font-bold text-center sm:text-left mb-6">Welcome to FlyNext</h1>
        <p className="text-xl text-center sm:text-left mb-6">
          Find the best flights and hotels, all in one place.
        </p>

        {/* Navigation buttons */}
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/flight-search"
          >
            Search Flights
          </Link>
          <Link
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="/hotel-search"
          >
            Search Hotels
          </Link>
        </div>
      </main>
      
      {/* <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
        >
          About FlyNext
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact Us
        </a>
      </footer> */}
    </div>
  );
}
