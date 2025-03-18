import { prisma } from "@utils/db";

// OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com
export function validateCreditCard(cardNumber, expiryMonth, expiryYear) {
    // Luhn Algorithm to validate card number
    function luhnCheck(num) {
        let sum = 0;
        let alternate = false;
        let digits = num.toString().split('').reverse().map(d => parseInt(d, 10));
        
        for (let digit of digits) {
            if (alternate) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            alternate = !alternate;
        }
        return sum % 10 === 0;
    }

    // Expiry date validation
    function isExpiryValid(month, year) {
        let today = new Date();
        let expiryDate = new Date(year, month, 0); // Last day of expiry month
        return expiryDate >= today;
    }

    return luhnCheck(cardNumber) && isExpiryValid(expiryMonth, expiryYear);
}

// OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com
export async function getAFSFlights(origin, destination, date) {
    try {
        const AFS_API_KEY = "64a61055322c29c719f9ec0ae7ce7cbf6145316fa3001096c3fadc50a0582863";
        const AFS_BASE_URL = "https://advanced-flights-system.replit.app/api/flights";

        // Construct query parameters
        const queryParams = new URLSearchParams({
            origin,
            destination,
            date
        });

        const fetched = await fetch(`${AFS_BASE_URL}?${queryParams.toString()}`, {
            method: "GET",
            headers: {
                "x-api-key": AFS_API_KEY
            }
        });
        const flightResults = await fetched.json();
        return flightResults;
    }
    catch (error) {
        return null;
    }
}

// Add notification for user, assuming userId exists
export async function sendNotification(userId, message) {
    await prisma.notification.create({
        data: {
            userId,
            message
        }
    });
}

// Get HotelOwner.id from given User.id, assuming userId exists and is a HotelOwner
export async function getHotelOwnerId(userId) {
    const hotelOwner = await prisma.hotelOwner.findUnique({
        where: {
            userId
        }
    });
    if (!hotelOwner) return null;
    return hotelOwner?.id;
}

export async function getUserIdByHotelOwnerId(hotelOwnerId) {
    const hotelOwner = await prisma.hotelOwner.findUnique({
        where: {
            id: hotelOwnerId
        }
    });
    if (!hotelOwner) return null;
    return hotelOwner?.userId;
}

// Check if HotelOwner owns the given Hotel, assuming both ids exist --> implicity checks if hotel exists
export async function ownsHotel(hotelOwnerId, hotelId) {
    const hotel = await prisma.hotel.findUnique({
        where: {
            id: hotelId
        }
    });
    if (!hotel) return false;
    return hotel?.ownerId === hotelOwnerId;
}
