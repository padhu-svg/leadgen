import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query || 'cafes Indiranagar Bengaluru';
    const category = body.category || 'Cafes & Restaurants';

    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8`;
    
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "DevifyLabsLeadEngine/1.0 (devifylabs.com)" },
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json({ places: [] });
    }

    const rawPlaces = await res.json();
    const places = (rawPlaces || []).map((p: any, idx: number) => {
      const rawDisplayName = p.display_name || 'Bangalore Business';
      const parts = rawDisplayName.split(',');
      const businessName = parts[0].trim();
      const locationAddress = parts.slice(1, 4).join(',').trim() || 'Bengaluru, Karnataka';
      
      const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName + ' ' + locationAddress)}`;

      let priceTag = "₹35,000 - ₹65,000";
      let currentStatus = "Missing Direct QR Code Menu & Table Ordering Web App";
      let whatTheyNeed = "QR Code Digital Menu + Table Ordering & UPI Payment Web App";
      let whyDevifyHelps = "Saves 15%-25% commission paid to Swiggy/Zomato on direct orders.";
      let whatsappPitch = `Hi! Loved visiting ${businessName} in ${parts[1] || 'Bengaluru'}. Noticed you're relying only on paper menus or Swiggy. Devify Labs builds custom QR Menu & Table Ordering Web Apps for Bangalore cafes in 4 days. Can I send a 30-sec video demo?`;

      if (category.includes("Clinic") || category.includes("Healthcare")) {
        priceTag = "₹45,000 - ₹95,000";
        currentStatus = "Missing Online Appointment Booking & Schedule Portal";
        whatTheyNeed = "Doctor Appointment Booking Website & Patient Schedule Portal";
        whyDevifyHelps = "Captures local patients searching on Google Maps; automates appointment reminders via WhatsApp.";
        whatsappPitch = `Hi Doctor! Saw your clinic listing for ${businessName} on Google Maps, but noticed you don't have an online appointment booking website yet. Devify Labs builds doctor appointment web portals in 5 days. Can I send a quick preview?`;
      } else if (category.includes("Real Estate")) {
        priceTag = "₹65,000 - ₹1,80,000";
        currentStatus = "Outdated Mobile Site / Missing Property Showcase Web App";
        whatTheyNeed = "Luxury Real Estate Web Application (Interactive Floor Plans & WhatsApp Lead Widget)";
        whyDevifyHelps = "Captures high-ticket HNI villa & apartment buyers with 1-click WhatsApp inquiry buttons.";
        whatsappPitch = `Hello! Saw your luxury property listings for ${businessName}. Your current mobile site delay is costing you high-ticket HNI leads. At Devify Labs, we build modern real estate web apps with 1-click WhatsApp lead capture. Open to seeing a free homepage concept?`;
      }

      return {
        id: `scraped-${p.place_id || idx}`,
        businessName,
        category,
        location: locationAddress,
        contactPhone: "Verified on Google Maps",
        mapsUrl: gmapsLink,
        priceTag,
        currentStatus,
        whatTheyNeed,
        whyDevifyHelps,
        whatsappPitch
      };
    });

    return NextResponse.json({ places });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, places: [] });
  }
}
