import urllib.request
import urllib.parse
import json

# Primary & Fallback Overpass Endpoints
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter"
]

bbox = "12.90,77.55,13.05,77.70" # Optimized Bangalore Center Bounding Box

# Modular tag queries
query = f"""[out:json][timeout:15];
(
  node["amenity"~"cafe|restaurant|bar|clinic|dentist"]({bbox});
  node["shop"~"salon|hairdresser|bakery|car_repair|boutique"]({bbox});
  node["office"="estate_agent"]({bbox});
  node["leisure"="fitness_centre"]({bbox});
);
out body 250;
"""

data = urllib.parse.urlencode({'data': query}).encode('utf-8')

for endpoint in OVERPASS_ENDPOINTS:
    print(f"Trying endpoint: {endpoint}...")
    try:
        req = urllib.request.Request(
            endpoint,
            data=data,
            headers={'User-Agent': 'DevifyLabsLeadEngine/1.0 (devifylabs.com)'}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            res = json.loads(response.read().decode('utf-8'))
            elements = res.get('elements', [])
            print(f"SUCCESS! RAW ELEMENTS RETURNED: {len(elements)}")

            qualifying = []
            for e in elements:
                tags = e.get('tags', {})
                name = tags.get('name')
                has_website = ('website' in tags) or ('contact:website' in tags)
                
                if name and not has_website:
                    cat_raw = (
                        tags.get('amenity') or 
                        tags.get('shop') or 
                        tags.get('office') or 
                        tags.get('leisure') or 
                        'local_business'
                    )
                    phone = tags.get('phone') or tags.get('contact:phone') or 'N/A'
                    suburb = tags.get('addr:suburb') or tags.get('addr:district') or tags.get('addr:street') or 'Bengaluru'
                    
                    qualifying.append({
                        'name': name,
                        'category': cat_raw.replace('_', ' ').title(),
                        'location': suburb,
                        'phone': phone,
                        'lat': e.get('lat'),
                        'lon': e.get('lon'),
                        'osm_id': e.get('id')
                    })

            print(f"QUALIFYING (HAS NAME & NO WEBSITE): {len(qualifying)}")
            print("\nFIRST 10 QUALIFYING LEADS:")
            for i, q in enumerate(qualifying[:10]):
                print(f"{i+1}. {q['name']} | Category: {q['category']} | Location: {q['location']} | Phone: {q['phone']}")
            break
    except Exception as err:
        print(f"Endpoint {endpoint} failed: {err}")
