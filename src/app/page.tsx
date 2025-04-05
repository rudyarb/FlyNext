import Image from "next/image";
import Link from "next/link";
import { FaPlane, FaHotel, FaMapMarkedAlt, FaHeadset } from "react-icons/fa";
import type { FeatureCard, DestinationCard } from "@/types/home";

const features: FeatureCard[] = [
  {
    icon: <FaPlane className="text-4xl text-blue-600 dark:text-blue-400" />,
    title: "Flight Booking",
    description: "Find the best deals on flights worldwide"
  },
  {
    icon: <FaHotel className="text-4xl text-blue-600 dark:text-blue-400" />,
    title: "Hotel Stays",
    description: "Book comfortable stays at great prices"
  },
  {
    icon: <FaMapMarkedAlt className="text-4xl text-blue-600 dark:text-blue-400" />,
    title: "Destinations",
    description: "Explore popular destinations worldwide"
  },
  {
    icon: <FaHeadset className="text-4xl text-blue-600 dark:text-blue-400" />,
    title: "24/7 Support",
    description: "Customer support around the clock"
  }
];

const destinations: DestinationCard[] = [
  {
    city: "Toronto",
    imageUrl: "/images/toronto.avif",
    country: "Canada"
  },
  {
    city: "Los Angeles",
    imageUrl: "/images/los-angeles.avif",
    country: "United States"
  },
  {
    city: "Tokyo",
    imageUrl: "/images/tokyo.avif",
    country: "Japan"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Welcome to <span className="text-blue-600 dark:text-blue-400">FlyNext</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Find the best flights and hotels, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/flight-search"
                className="px-8 py-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-center transition-colors duration-200"
              >
                Search Flights
              </Link>
              <Link
                href="/hotel-search"
                className="px-8 py-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-center transition-colors duration-200"
              >
                Search Hotels
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Popular Destinations */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-8">
              Popular Destinations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {destinations.map((destination) => (
                <div
                  key={destination.city}
                  className="relative h-64 rounded-lg overflow-hidden group"
                >
                  <Image
                    src={destination.imageUrl}
                    alt={`${destination.city}, ${destination.country}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {destination.city}
                      </h3>
                      <p className="text-sm text-white/80 mb-2">
                        {destination.country}
                      </p>
                      <Link
                        href={`/hotel-search?city=${destination.city}`}
                        className="text-sm text-white hover:text-blue-400 transition-colors inline-flex items-center"
                      >
                        Explore hotels
                        <span className="ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
