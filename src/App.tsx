import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info, X } from 'lucide-react'

type Region = 'World' | 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'US States'

interface Capital {
  city: string
  country: string
  lat: number
  lng: number
  region: Exclude<Region, 'World' | 'US States'>
}

interface StateCapital {
  city: string
  state: string
  lat: number
  lng: number
}

const US_STATE_CAPITALS: StateCapital[] = [
  { city: "Montgomery", state: "Alabama", lat: 32.3792, lng: -86.3077 },
  { city: "Juneau", state: "Alaska", lat: 58.3019, lng: -134.4197 },
  { city: "Phoenix", state: "Arizona", lat: 33.4484, lng: -112.0740 },
  { city: "Little Rock", state: "Arkansas", lat: 34.7465, lng: -92.2896 },
  { city: "Sacramento", state: "California", lat: 38.5816, lng: -121.4944 },
  { city: "Denver", state: "Colorado", lat: 39.7392, lng: -104.9903 },
  { city: "Hartford", state: "Connecticut", lat: 41.7658, lng: -72.6734 },
  { city: "Dover", state: "Delaware", lat: 39.1582, lng: -75.5244 },
  { city: "Tallahassee", state: "Florida", lat: 30.4383, lng: -84.2807 },
  { city: "Atlanta", state: "Georgia", lat: 33.7490, lng: -84.3880 },
  { city: "Honolulu", state: "Hawaii", lat: 21.3069, lng: -157.8583 },
  { city: "Boise", state: "Idaho", lat: 43.6150, lng: -116.2023 },
  { city: "Springfield", state: "Illinois", lat: 39.7817, lng: -89.6501 },
  { city: "Indianapolis", state: "Indiana", lat: 39.7684, lng: -86.1581 },
  { city: "Des Moines", state: "Iowa", lat: 41.5868, lng: -93.6250 },
  { city: "Topeka", state: "Kansas", lat: 39.0473, lng: -95.6752 },
  { city: "Frankfort", state: "Kentucky", lat: 38.2009, lng: -84.8733 },
  { city: "Baton Rouge", state: "Louisiana", lat: 30.4515, lng: -91.1871 },
  { city: "Augusta", state: "Maine", lat: 44.3106, lng: -69.7795 },
  { city: "Annapolis", state: "Maryland", lat: 38.9784, lng: -76.4922 },
  { city: "Boston", state: "Massachusetts", lat: 42.3601, lng: -71.0589 },
  { city: "Lansing", state: "Michigan", lat: 42.7325, lng: -84.5555 },
  { city: "Saint Paul", state: "Minnesota", lat: 44.9537, lng: -93.0900 },
  { city: "Jackson", state: "Mississippi", lat: 32.2988, lng: -90.1848 },
  { city: "Jefferson City", state: "Missouri", lat: 38.5767, lng: -92.1735 },
  { city: "Helena", state: "Montana", lat: 46.5891, lng: -112.0391 },
  { city: "Lincoln", state: "Nebraska", lat: 40.8258, lng: -96.6852 },
  { city: "Carson City", state: "Nevada", lat: 39.1638, lng: -119.7674 },
  { city: "Concord", state: "New Hampshire", lat: 43.2081, lng: -71.5376 },
  { city: "Trenton", state: "New Jersey", lat: 40.2206, lng: -74.7597 },
  { city: "Santa Fe", state: "New Mexico", lat: 35.6870, lng: -105.9378 },
  { city: "Albany", state: "New York", lat: 42.6526, lng: -73.7562 },
  { city: "Raleigh", state: "North Carolina", lat: 35.7796, lng: -78.6382 },
  { city: "Bismarck", state: "North Dakota", lat: 46.8083, lng: -100.7837 },
  { city: "Columbus", state: "Ohio", lat: 39.9612, lng: -82.9988 },
  { city: "Oklahoma City", state: "Oklahoma", lat: 35.4676, lng: -97.5164 },
  { city: "Salem", state: "Oregon", lat: 44.9429, lng: -123.0351 },
  { city: "Harrisburg", state: "Pennsylvania", lat: 40.2732, lng: -76.8867 },
  { city: "Providence", state: "Rhode Island", lat: 41.8240, lng: -71.4128 },
  { city: "Columbia", state: "South Carolina", lat: 34.0007, lng: -81.0348 },
  { city: "Pierre", state: "South Dakota", lat: 44.3683, lng: -100.3510 },
  { city: "Nashville", state: "Tennessee", lat: 36.1627, lng: -86.7816 },
  { city: "Austin", state: "Texas", lat: 30.2672, lng: -97.7431 },
  { city: "Salt Lake City", state: "Utah", lat: 40.7608, lng: -111.8910 },
  { city: "Montpelier", state: "Vermont", lat: 44.2601, lng: -72.5754 },
  { city: "Richmond", state: "Virginia", lat: 37.5407, lng: -77.4360 },
  { city: "Olympia", state: "Washington", lat: 47.0379, lng: -122.9007 },
  { city: "Charleston", state: "West Virginia", lat: 38.3498, lng: -81.6326 },
  { city: "Madison", state: "Wisconsin", lat: 43.0731, lng: -89.4012 },
  { city: "Cheyenne", state: "Wyoming", lat: 41.1400, lng: -104.8202 },
]

const CAPITALS: Capital[] = [
  // Americas
  { city: "Washington D.C.", country: "United States", lat: 38.9072, lng: -77.0369, region: "Americas" },
  { city: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972, region: "Americas" },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, region: "Americas" },
  { city: "Brasilia", country: "Brazil", lat: -15.7975, lng: -47.8919, region: "Americas" },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, region: "Americas" },
  { city: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428, region: "Americas" },
  { city: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721, region: "Americas" },
  { city: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693, region: "Americas" },
  { city: "Caracas", country: "Venezuela", lat: 10.4806, lng: -66.9036, region: "Americas" },
  { city: "Havana", country: "Cuba", lat: 23.1136, lng: -82.3666, region: "Americas" },
  { city: "Guatemala City", country: "Guatemala", lat: 14.6349, lng: -90.5069, region: "Americas" },
  { city: "Quito", country: "Ecuador", lat: -0.1807, lng: -78.4678, region: "Americas" },
  { city: "La Paz", country: "Bolivia", lat: -16.4897, lng: -68.1193, region: "Americas" },
  { city: "Asuncion", country: "Paraguay", lat: -25.2637, lng: -57.5759, region: "Americas" },
  { city: "Montevideo", country: "Uruguay", lat: -34.9011, lng: -56.1645, region: "Americas" },
  { city: "San Jose", country: "Costa Rica", lat: 9.9281, lng: -84.0907, region: "Americas" },
  { city: "Panama City", country: "Panama", lat: 8.9824, lng: -79.5199, region: "Americas" },
  { city: "Kingston", country: "Jamaica", lat: 17.9714, lng: -76.7920, region: "Americas" },
  { city: "Port-au-Prince", country: "Haiti", lat: 18.5944, lng: -72.3074, region: "Americas" },
  { city: "Santo Domingo", country: "Dominican Republic", lat: 18.4861, lng: -69.9312, region: "Americas" },
  { city: "Tegucigalpa", country: "Honduras", lat: 14.0723, lng: -87.1921, region: "Americas" },
  { city: "Managua", country: "Nicaragua", lat: 12.1150, lng: -86.2362, region: "Americas" },
  { city: "San Salvador", country: "El Salvador", lat: 13.6929, lng: -89.2182, region: "Americas" },
  { city: "Nassau", country: "Bahamas", lat: 25.0480, lng: -77.3554, region: "Americas" },
  { city: "Bridgetown", country: "Barbados", lat: 13.1132, lng: -59.5988, region: "Americas" },
  { city: "Port of Spain", country: "Trinidad and Tobago", lat: 10.6596, lng: -61.5086, region: "Americas" },
  { city: "Georgetown", country: "Guyana", lat: 6.8013, lng: -58.1551, region: "Americas" },
  { city: "Paramaribo", country: "Suriname", lat: 5.8520, lng: -55.2038, region: "Americas" },
  { city: "Belmopan", country: "Belize", lat: 17.2510, lng: -88.7590, region: "Americas" },
  
  // Europe
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, region: "Europe" },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522, region: "Europe" },
  { city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, region: "Europe" },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, region: "Europe" },
  { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, region: "Europe" },
  { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, region: "Europe" },
  { city: "Kyiv", country: "Ukraine", lat: 50.4501, lng: 30.5234, region: "Europe" },
  { city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686, region: "Europe" },
  { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738, region: "Europe" },
  { city: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275, region: "Europe" },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, region: "Europe" },
  { city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603, region: "Europe" },
  { city: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522, region: "Europe" },
  { city: "Helsinki", country: "Finland", lat: 60.1699, lng: 24.9384, region: "Europe" },
  { city: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122, region: "Europe" },
  { city: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378, region: "Europe" },
  { city: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402, region: "Europe" },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, region: "Europe" },
  { city: "Brussels", country: "Belgium", lat: 50.8503, lng: 4.3517, region: "Europe" },
  { city: "Bern", country: "Switzerland", lat: 46.9480, lng: 7.4474, region: "Europe" },
  { city: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683, region: "Europe" },
  { city: "Bucharest", country: "Romania", lat: 44.4268, lng: 26.1025, region: "Europe" },
  { city: "Sofia", country: "Bulgaria", lat: 42.6977, lng: 23.3219, region: "Europe" },
  { city: "Belgrade", country: "Serbia", lat: 44.7866, lng: 20.4489, region: "Europe" },
  { city: "Zagreb", country: "Croatia", lat: 45.8150, lng: 15.9819, region: "Europe" },
  { city: "Ljubljana", country: "Slovenia", lat: 46.0569, lng: 14.5058, region: "Europe" },
  { city: "Bratislava", country: "Slovakia", lat: 48.1486, lng: 17.1077, region: "Europe" },
  { city: "Tallinn", country: "Estonia", lat: 59.4370, lng: 24.7536, region: "Europe" },
  { city: "Riga", country: "Latvia", lat: 56.9496, lng: 24.1052, region: "Europe" },
  { city: "Vilnius", country: "Lithuania", lat: 54.6872, lng: 25.2797, region: "Europe" },
  { city: "Minsk", country: "Belarus", lat: 53.9006, lng: 27.5590, region: "Europe" },
  { city: "Chisinau", country: "Moldova", lat: 47.0105, lng: 28.8638, region: "Europe" },
  { city: "Tirana", country: "Albania", lat: 41.3275, lng: 19.8187, region: "Europe" },
  { city: "Skopje", country: "North Macedonia", lat: 41.9973, lng: 21.4280, region: "Europe" },
  { city: "Podgorica", country: "Montenegro", lat: 42.4304, lng: 19.2594, region: "Europe" },
  { city: "Sarajevo", country: "Bosnia and Herzegovina", lat: 43.8563, lng: 18.4131, region: "Europe" },
  { city: "Reykjavik", country: "Iceland", lat: 64.1466, lng: -21.9426, region: "Europe" },
  { city: "Luxembourg City", country: "Luxembourg", lat: 49.6116, lng: 6.1319, region: "Europe" },
  { city: "Monaco", country: "Monaco", lat: 43.7384, lng: 7.4246, region: "Europe" },
  { city: "Andorra la Vella", country: "Andorra", lat: 42.5063, lng: 1.5218, region: "Europe" },
  { city: "Valletta", country: "Malta", lat: 35.8989, lng: 14.5146, region: "Europe" },
  { city: "San Marino", country: "San Marino", lat: 43.9424, lng: 12.4578, region: "Europe" },
  { city: "Vatican City", country: "Vatican City", lat: 41.9029, lng: 12.4534, region: "Europe" },
  
  // Asia
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, region: "Asia" },
  { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, region: "Asia" },
  { city: "New Delhi", country: "India", lat: 28.6139, lng: 77.2090, region: "Asia" },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, region: "Asia" },
  { city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, region: "Asia" },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, region: "Asia" },
  { city: "Ankara", country: "Turkey", lat: 39.9334, lng: 32.8597, region: "Asia" },
  { city: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542, region: "Asia" },
  { city: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842, region: "Asia" },
  { city: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869, region: "Asia" },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, region: "Asia" },
  { city: "Taipei", country: "Taiwan", lat: 25.0330, lng: 121.5654, region: "Asia" },
  { city: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125, region: "Asia" },
  { city: "Islamabad", country: "Pakistan", lat: 33.6844, lng: 73.0479, region: "Asia" },
  { city: "Kabul", country: "Afghanistan", lat: 34.5553, lng: 69.2075, region: "Asia" },
  { city: "Tehran", country: "Iran", lat: 35.6892, lng: 51.3890, region: "Asia" },
  { city: "Baghdad", country: "Iraq", lat: 33.3152, lng: 44.3661, region: "Asia" },
  { city: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, region: "Asia" },
  { city: "Jerusalem", country: "Israel", lat: 31.7683, lng: 35.2137, region: "Asia" },
  { city: "Amman", country: "Jordan", lat: 31.9454, lng: 35.9284, region: "Asia" },
  { city: "Beirut", country: "Lebanon", lat: 33.8938, lng: 35.5018, region: "Asia" },
  { city: "Damascus", country: "Syria", lat: 33.5138, lng: 36.2765, region: "Asia" },
  { city: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lng: 54.3773, region: "Asia" },
  { city: "Doha", country: "Qatar", lat: 25.2854, lng: 51.5310, region: "Asia" },
  { city: "Kuwait City", country: "Kuwait", lat: 29.3759, lng: 47.9774, region: "Asia" },
  { city: "Muscat", country: "Oman", lat: 23.5880, lng: 58.3829, region: "Asia" },
  { city: "Manama", country: "Bahrain", lat: 26.2285, lng: 50.5860, region: "Asia" },
  { city: "Kathmandu", country: "Nepal", lat: 27.7172, lng: 85.3240, region: "Asia" },
  { city: "Colombo", country: "Sri Lanka", lat: 6.9271, lng: 79.8612, region: "Asia" },
  { city: "Thimphu", country: "Bhutan", lat: 27.4728, lng: 89.6390, region: "Asia" },
  { city: "Male", country: "Maldives", lat: 4.1755, lng: 73.5093, region: "Asia" },
  { city: "Naypyidaw", country: "Myanmar", lat: 19.7633, lng: 96.0785, region: "Asia" },
  { city: "Phnom Penh", country: "Cambodia", lat: 11.5564, lng: 104.9282, region: "Asia" },
  { city: "Vientiane", country: "Laos", lat: 17.9757, lng: 102.6331, region: "Asia" },
  { city: "Pyongyang", country: "North Korea", lat: 39.0392, lng: 125.7625, region: "Asia" },
  { city: "Ulaanbaatar", country: "Mongolia", lat: 47.8864, lng: 106.9057, region: "Asia" },
  { city: "Astana", country: "Kazakhstan", lat: 51.1694, lng: 71.4491, region: "Asia" },
  { city: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401, region: "Asia" },
  { city: "Bishkek", country: "Kyrgyzstan", lat: 42.8746, lng: 74.5698, region: "Asia" },
  { city: "Dushanbe", country: "Tajikistan", lat: 38.5598, lng: 68.7740, region: "Asia" },
  { city: "Ashgabat", country: "Turkmenistan", lat: 37.9601, lng: 58.3261, region: "Asia" },
  { city: "Baku", country: "Azerbaijan", lat: 40.4093, lng: 49.8671, region: "Asia" },
  { city: "Tbilisi", country: "Georgia", lat: 41.7151, lng: 44.8271, region: "Asia" },
  { city: "Yerevan", country: "Armenia", lat: 40.1792, lng: 44.4991, region: "Asia" },
  { city: "Nicosia", country: "Cyprus", lat: 35.1856, lng: 33.3823, region: "Asia" },
  { city: "Bandar Seri Begawan", country: "Brunei", lat: 4.9031, lng: 114.9398, region: "Asia" },
  { city: "Dili", country: "Timor-Leste", lat: -8.5569, lng: 125.5603, region: "Asia" },
  
  // Africa
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, region: "Africa" },
  { city: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, region: "Africa" },
  { city: "Pretoria", country: "South Africa", lat: -25.7479, lng: 28.2293, region: "Africa" },
  { city: "Abuja", country: "Nigeria", lat: 9.0765, lng: 7.3986, region: "Africa" },
  { city: "Addis Ababa", country: "Ethiopia", lat: 8.9806, lng: 38.7578, region: "Africa" },
  { city: "Algiers", country: "Algeria", lat: 36.7538, lng: 3.0588, region: "Africa" },
  { city: "Rabat", country: "Morocco", lat: 34.0209, lng: -6.8416, region: "Africa" },
  { city: "Tunis", country: "Tunisia", lat: 36.8065, lng: 10.1815, region: "Africa" },
  { city: "Tripoli", country: "Libya", lat: 32.8872, lng: 13.1913, region: "Africa" },
  { city: "Khartoum", country: "Sudan", lat: 15.5007, lng: 32.5599, region: "Africa" },
  { city: "Accra", country: "Ghana", lat: 5.6037, lng: -0.1870, region: "Africa" },
  { city: "Dakar", country: "Senegal", lat: 14.7167, lng: -17.4677, region: "Africa" },
  { city: "Kampala", country: "Uganda", lat: 0.3476, lng: 32.5825, region: "Africa" },
  { city: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lng: 39.2083, region: "Africa" },
  { city: "Kinshasa", country: "Democratic Republic of the Congo", lat: -4.4419, lng: 15.2663, region: "Africa" },
  { city: "Luanda", country: "Angola", lat: -8.8390, lng: 13.2894, region: "Africa" },
  { city: "Maputo", country: "Mozambique", lat: -25.9692, lng: 32.5732, region: "Africa" },
  { city: "Harare", country: "Zimbabwe", lat: -17.8252, lng: 31.0335, region: "Africa" },
  { city: "Lusaka", country: "Zambia", lat: -15.3875, lng: 28.3228, region: "Africa" },
  { city: "Windhoek", country: "Namibia", lat: -22.5609, lng: 17.0658, region: "Africa" },
  { city: "Gaborone", country: "Botswana", lat: -24.6282, lng: 25.9231, region: "Africa" },
  { city: "Antananarivo", country: "Madagascar", lat: -18.8792, lng: 47.5079, region: "Africa" },
  { city: "Port Louis", country: "Mauritius", lat: -20.1609, lng: 57.5012, region: "Africa" },
  { city: "Abidjan", country: "Ivory Coast", lat: 5.3600, lng: -4.0083, region: "Africa" },
  { city: "Bamako", country: "Mali", lat: 12.6392, lng: -8.0029, region: "Africa" },
  { city: "Ouagadougou", country: "Burkina Faso", lat: 12.3714, lng: -1.5197, region: "Africa" },
  { city: "Niamey", country: "Niger", lat: 13.5137, lng: 2.1098, region: "Africa" },
  { city: "Conakry", country: "Guinea", lat: 9.6412, lng: -13.5784, region: "Africa" },
  { city: "Freetown", country: "Sierra Leone", lat: 8.4657, lng: -13.2317, region: "Africa" },
  { city: "Monrovia", country: "Liberia", lat: 6.2907, lng: -10.7605, region: "Africa" },
  { city: "Lome", country: "Togo", lat: 6.1256, lng: 1.2254, region: "Africa" },
  { city: "Cotonou", country: "Benin", lat: 6.3703, lng: 2.3912, region: "Africa" },
  { city: "Nouakchott", country: "Mauritania", lat: 18.0735, lng: -15.9582, region: "Africa" },
  { city: "Libreville", country: "Gabon", lat: 0.4162, lng: 9.4673, region: "Africa" },
  { city: "Brazzaville", country: "Republic of the Congo", lat: -4.2634, lng: 15.2429, region: "Africa" },
  { city: "Yaounde", country: "Cameroon", lat: 3.8480, lng: 11.5021, region: "Africa" },
  { city: "Bangui", country: "Central African Republic", lat: 4.3947, lng: 18.5582, region: "Africa" },
  { city: "Ndjamena", country: "Chad", lat: 12.1348, lng: 15.0557, region: "Africa" },
  { city: "Kigali", country: "Rwanda", lat: -1.9403, lng: 29.8739, region: "Africa" },
  { city: "Bujumbura", country: "Burundi", lat: -3.3731, lng: 29.3644, region: "Africa" },
  { city: "Asmara", country: "Eritrea", lat: 15.3229, lng: 38.9251, region: "Africa" },
  { city: "Djibouti", country: "Djibouti", lat: 11.5721, lng: 43.1456, region: "Africa" },
  { city: "Mogadishu", country: "Somalia", lat: 2.0469, lng: 45.3182, region: "Africa" },
  { city: "Juba", country: "South Sudan", lat: 4.8594, lng: 31.5713, region: "Africa" },
  { city: "Lilongwe", country: "Malawi", lat: -13.9626, lng: 33.7741, region: "Africa" },
  { city: "Victoria", country: "Seychelles", lat: -4.6191, lng: 55.4513, region: "Africa" },
  { city: "Moroni", country: "Comoros", lat: -11.7172, lng: 43.2473, region: "Africa" },
  { city: "Praia", country: "Cape Verde", lat: 14.9315, lng: -23.5087, region: "Africa" },
  { city: "Sao Tome", country: "Sao Tome and Principe", lat: 0.3302, lng: 6.7333, region: "Africa" },
  { city: "Malabo", country: "Equatorial Guinea", lat: 3.7504, lng: 8.7371, region: "Africa" },
  { city: "Mbabane", country: "Eswatini", lat: -26.3054, lng: 31.1367, region: "Africa" },
  { city: "Maseru", country: "Lesotho", lat: -29.3167, lng: 27.4833, region: "Africa" },
  
  // Oceania
  { city: "Canberra", country: "Australia", lat: -35.2809, lng: 149.1300, region: "Oceania" },
  { city: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762, region: "Oceania" },
  { city: "Port Moresby", country: "Papua New Guinea", lat: -9.4438, lng: 147.1803, region: "Oceania" },
  { city: "Suva", country: "Fiji", lat: -18.1416, lng: 178.4419, region: "Oceania" },
  { city: "Honiara", country: "Solomon Islands", lat: -9.4456, lng: 159.9729, region: "Oceania" },
  { city: "Port Vila", country: "Vanuatu", lat: -17.7333, lng: 168.3167, region: "Oceania" },
  { city: "Apia", country: "Samoa", lat: -13.8333, lng: -171.7500, region: "Oceania" },
  { city: "Nuku'alofa", country: "Tonga", lat: -21.2114, lng: -175.1998, region: "Oceania" },
  { city: "Tarawa", country: "Kiribati", lat: 1.3382, lng: 173.0176, region: "Oceania" },
  { city: "Majuro", country: "Marshall Islands", lat: 7.1164, lng: 171.1858, region: "Oceania" },
  { city: "Palikir", country: "Micronesia", lat: 6.9248, lng: 158.1610, region: "Oceania" },
  { city: "Yaren", country: "Nauru", lat: -0.5477, lng: 166.9209, region: "Oceania" },
  { city: "Funafuti", country: "Tuvalu", lat: -8.5211, lng: 179.1983, region: "Oceania" },
  { city: "Ngerulmud", country: "Palau", lat: 7.5006, lng: 134.6242, region: "Oceania" },
]

const MAX_WRONG_GUESSES = 6

function MapController({ zoom, center, isInitial, shouldPan, gameOver, isUSStatesMode }: { zoom: number; center: [number, number]; isInitial: boolean; shouldPan: boolean; gameOver: boolean; isUSStatesMode: boolean }) {
  const map = useMap()
  const hasInitialized = useRef(false)
  
  // US center coordinates (roughly center of continental US)
  const US_CENTER: [number, number] = [39.8, -98.5]
  
  useEffect(() => {
    if (!hasInitialized.current || isInitial) {
      // Initial load: center on 0,0 for world, or US center for US States mode (same zoom level)
      const initialCenter = isUSStatesMode ? US_CENTER : [0, 0] as [number, number]
      map.setView(initialCenter, zoom, { animate: false })
      hasInitialized.current = true
    } else if (shouldPan && !gameOver) {
      // On wrong guess: pan to location (keep same zoom)
      map.flyTo(center, zoom, { duration: 2, easeLinearity: 0.2 })
    } else if (gameOver) {
      // On game over: pan to final location
      map.flyTo(center, zoom, { duration: 1, easeLinearity: 0.2 })
    }
  }, [zoom, center, map, isInitial, shouldPan, gameOver, isUSStatesMode])

  // Enable/disable map interactivity based on game state
  useEffect(() => {
    if (gameOver) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
      map.touchZoom.enable()
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
      map.touchZoom.disable()
    }
  }, [gameOver, map])

  return null
}

// Fisher-Yates shuffle function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function App() {
  const [currentCapital, setCurrentCapital] = useState<Capital | null>(null)
  const [currentStateCapital, setCurrentStateCapital] = useState<StateCapital | null>(null)
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [countryGeoJson, setCountryGeoJson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [region, setRegion] = useState<Region>('World')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [showInfo, setShowInfo] = useState(false)
    const [shouldPan, setShouldPan] = useState(false)
    const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false)
  
  // Shuffled lists and indices for each category to avoid repeats
  const [shuffledCapitals, setShuffledCapitals] = useState<Capital[]>([])
  const [shuffledStateCapitals, setShuffledStateCapitals] = useState<StateCapital[]>([])
  const [capitalIndex, setCapitalIndex] = useState(0)
  const [stateCapitalIndex, setStateCapitalIndex] = useState(0)
  
  // Load score and gamesPlayed from localStorage
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('mapitals-score')
    return saved ? parseInt(saved, 10) : 0
  })
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    const saved = localStorage.getItem('mapitals-games-played')
    return saved ? parseInt(saved, 10) : 0
  })

  const isUSStatesMode = region === 'US States'

  const capitalsForRegion = useMemo(() => 
    region === 'World' ? CAPITALS : CAPITALS.filter(c => c.region === region),
    [region]
  )

  // Save score to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapitals-score', score.toString())
  }, [score])

  // Save gamesPlayed to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapitals-games-played', gamesPlayed.toString())
  }, [gamesPlayed])

  // Shuffle capitals when region changes (for non-US States modes)
  useEffect(() => {
    if (!isUSStatesMode) {
      setShuffledCapitals(shuffleArray(capitalsForRegion))
      setCapitalIndex(0)
    }
  }, [region, capitalsForRegion, isUSStatesMode])

  // Shuffle state capitals when switching to US States mode
  useEffect(() => {
    if (isUSStatesMode) {
      setShuffledStateCapitals(shuffleArray(US_STATE_CAPITALS))
      setStateCapitalIndex(0)
    }
  }, [isUSStatesMode])

  const getNextCapital = useCallback(() => {
    if (shuffledCapitals.length === 0) return CAPITALS[0]
    // If we've gone through all capitals, reshuffle
    if (capitalIndex >= shuffledCapitals.length) {
      const newShuffled = shuffleArray(capitalsForRegion)
      setShuffledCapitals(newShuffled)
      setCapitalIndex(1)
      return newShuffled[0]
    }
    const capital = shuffledCapitals[capitalIndex]
    setCapitalIndex(prev => prev + 1)
    return capital
  }, [shuffledCapitals, capitalIndex, capitalsForRegion])

  const getNextStateCapital = useCallback(() => {
    if (shuffledStateCapitals.length === 0) return US_STATE_CAPITALS[0]
    // If we've gone through all state capitals, reshuffle
    if (stateCapitalIndex >= shuffledStateCapitals.length) {
      const newShuffled = shuffleArray(US_STATE_CAPITALS)
      setShuffledStateCapitals(newShuffled)
      setStateCapitalIndex(1)
      return newShuffled[0]
    }
    const stateCapital = shuffledStateCapitals[stateCapitalIndex]
    setStateCapitalIndex(prev => prev + 1)
    return stateCapital
  }, [shuffledStateCapitals, stateCapitalIndex])

  const startNewGame = useCallback(() => {
    if (isUSStatesMode) {
      setCurrentStateCapital(getNextStateCapital())
      setCurrentCapital(null)
    } else {
      setCurrentCapital(getNextCapital())
      setCurrentStateCapital(null)
    }
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setGameOver(false)
    setWon(false)
    setIsInitialLoad(true)
    setShouldPan(false)
    setTimeout(() => setIsInitialLoad(false), 100)
  }, [getNextCapital, getNextStateCapital, isUSStatesMode])

  // Initialize game on first load
  useEffect(() => {
    // Wait for shuffled lists to be ready before starting
    if (!isUSStatesMode && shuffledCapitals.length > 0) {
      startNewGame()
    } else if (isUSStatesMode && shuffledStateCapitals.length > 0) {
      startNewGame()
    }
  }, [shuffledCapitals.length, shuffledStateCapitals.length])

  // Start new game when region changes (after shuffle is done)
  const prevRegionRef = useRef<Region | null>(null)
  useEffect(() => {
    if (prevRegionRef.current !== null && prevRegionRef.current !== region) {
      // Region changed, start new game after a short delay to let shuffle complete
      setTimeout(() => startNewGame(), 50)
    }
    prevRegionRef.current = region
  }, [region, startNewGame])

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => setCountryGeoJson(data))
      .catch(err => console.error('Failed to load country borders:', err))
  }, [])

  const getDisplayText = (text: string) => {
    return text.split('').map(char => {
      if (char === ' ' || char === '.' || char === '-' || char === "'" || char === ',') return char
      if (guessedLetters.has(char.toLowerCase())) return char
      return '_'
    }).join('')
  }

  const isWordCompleteWithSet = (text: string, letterSet: Set<string>) => {
    return text.split('').every(char => {
      if (char === ' ' || char === '.' || char === '-' || char === "'" || char === ',') return true
      return letterSet.has(char.toLowerCase())
    })
  }

  const handleGuess = useCallback((letter: string) => {
    if (gameOver || guessedLetters.has(letter.toLowerCase())) return
    
    const newGuessedLetters = new Set(guessedLetters)
    newGuessedLetters.add(letter.toLowerCase())
    setGuessedLetters(newGuessedLetters)

    const city = isUSStatesMode ? currentStateCapital?.city : currentCapital?.city
    const regionName = isUSStatesMode ? currentStateCapital?.state : currentCapital?.country

    if (!city || !regionName) return

    const fullText = `${city}${regionName}`.toLowerCase()
    if (!fullText.includes(letter.toLowerCase())) {
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)
      setShouldPan(true)
      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setGameOver(true)
        setGamesPlayed(prev => prev + 1)
      }
    } else {
      const tempGuessed = new Set(newGuessedLetters)
      if (isWordCompleteWithSet(city, tempGuessed) && 
          isWordCompleteWithSet(regionName, tempGuessed)) {
        setGameOver(true)
        setWon(true)
        setScore(prev => prev + (MAX_WRONG_GUESSES - wrongGuesses))
        setGamesPlayed(prev => prev + 1)
      }
    }
  }, [gameOver, guessedLetters, currentCapital, currentStateCapital, wrongGuesses, isUSStatesMode])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses while the region dropdown is open
      if (isRegionMenuOpen) return
      
      const el = document.activeElement as HTMLElement | null
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const raw = e.key
      if (raw.length !== 1) return // Ignore multi-character keys like 'Enter', 'ArrowLeft', etc.

      const key = raw.toUpperCase()
      if (key >= 'A' && key <= 'Z') {
        e.preventDefault()
        handleGuess(key)
      }
    }

    if (!gameOver) {
      window.addEventListener('keydown', onKeyDown)
    }

      return () => window.removeEventListener('keydown', onKeyDown)
    }, [gameOver, handleGuess, isRegionMenuOpen])

  // Keep zoom constant - first two levels are the same so first wrong guess only pans
  const ADJUSTED_ZOOM_LEVELS = [2, 2, 3, 3.5, 4, 5, 6]
  const currentZoom = ADJUSTED_ZOOM_LEVELS[Math.min(wrongGuesses, ADJUSTED_ZOOM_LEVELS.length - 1)]
  
  const mapCenter: [number, number] = isUSStatesMode
    ? (currentStateCapital ? [currentStateCapital.lat, currentStateCapital.lng] : [0, 0])
    : (currentCapital ? [currentCapital.lat, currentCapital.lng] : [0, 0])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const tileUrl = gameOver
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

  const getCountryStyle = () => ({
    fillColor: '#ff6b6b',
    weight: 3,
    opacity: 1,
    color: '#ff6b6b',
    fillOpacity: 0.2
  })

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex flex-col h-screen">
        <header className="bg-slate-800/90 p-3 shadow-lg z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-emerald-400">Mapitals</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(true)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 p-2"
              >
                <Info size={20} />
              </Button>
                            <Select 
                              value={region} 
                              onValueChange={(value) => setRegion(value as Region)}
                              onOpenChange={setIsRegionMenuOpen}
                            >
                              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder="Region" />
                              </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600" style={{ zIndex: 9999 }}>
                  <SelectItem value="World" className="text-white hover:bg-slate-700">World</SelectItem>
                  <SelectItem value="Americas" className="text-white hover:bg-slate-700">Americas</SelectItem>
                  <SelectItem value="Europe" className="text-white hover:bg-slate-700">Europe</SelectItem>
                  <SelectItem value="Asia" className="text-white hover:bg-slate-700">Asia</SelectItem>
                  <SelectItem value="Africa" className="text-white hover:bg-slate-700">Africa</SelectItem>
                  <SelectItem value="Oceania" className="text-white hover:bg-slate-700">Oceania</SelectItem>
                  <SelectItem value="US States" className="text-white hover:bg-slate-700">US States</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">Score: <span className="text-emerald-400 font-bold">{score}</span></span>
              <span className="text-sm">Games: <span className="text-emerald-400 font-bold">{gamesPlayed}</span></span>
            </div>
          </div>
        </header>

        <main className="flex-1 relative">
          <div className="absolute inset-0">
            <MapContainer
              center={[0, 0]}
              zoom={2}
              className="h-full w-full"
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              zoomSnap={0.5}
            >
              <TileLayer
                key={gameOver ? 'political' : 'satellite'}
                url={tileUrl}
              />
              {gameOver && countryGeoJson && currentCapital && !isUSStatesMode && (
                <GeoJSON 
                  key={currentCapital.country}
                  data={countryGeoJson}
                  style={getCountryStyle}
                  filter={(feature) => {
                    const countryName = feature.properties?.ADMIN || feature.properties?.name
                    return countryName?.toLowerCase() === currentCapital.country.toLowerCase()
                  }}
                />
              )}
              <MapController zoom={currentZoom} center={mapCenter} isInitial={isInitialLoad} shouldPan={shouldPan} gameOver={gameOver} isUSStatesMode={isUSStatesMode} />
            </MapContainer>
          </div>
            
          <div className="absolute top-4 left-4 bg-slate-900/80 px-4 py-2 rounded-lg backdrop-blur-sm" style={{ zIndex: 1000 }}>
            <span className="text-red-400 font-bold">
              Wrong guesses: {wrongGuesses} / {MAX_WRONG_GUESSES}
            </span>
          </div>

          {gameOver && (
            <div className="absolute inset-x-0 top-16 flex justify-center" style={{ zIndex: 1001 }}>
              <div className="bg-slate-800/95 border border-slate-600 text-white max-w-md rounded-xl p-6 backdrop-blur-sm mx-4">
                <h2 className={`text-2xl font-bold mb-4 ${won ? "text-emerald-400" : "text-red-400"}`}>
                  {won ? "Congratulations!" : "Game Over!"}
                </h2>
                <p className="text-xl mb-2">
                  The answer was: <span className="font-bold text-emerald-400">{isUSStatesMode ? currentStateCapital?.city : currentCapital?.city}</span>, <span className="font-bold text-amber-400">{isUSStatesMode ? currentStateCapital?.state : currentCapital?.country}</span>
                </p>
                {won && (
                  <p className="text-lg mb-4">
                    Points earned: <span className="text-emerald-400 font-bold">+{MAX_WRONG_GUESSES - wrongGuesses}</span>
                  </p>
                )}
                <Button 
                  onClick={startNewGame}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}

          {showInfo && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 1002 }}>
              <div className="bg-slate-800/95 border border-slate-600 text-white max-w-lg rounded-xl p-6 backdrop-blur-sm mx-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-slate-700 p-1"
                >
                  <X size={20} />
                </Button>
                <h2 className="text-2xl font-bold mb-4 text-emerald-400">How to Play</h2>
                <div className="space-y-3 text-slate-300">
                  <p>Guess the capital city and country by selecting letters. The map starts zoomed out showing the whole world.</p>
                  <p>Each wrong guess zooms the map closer to the location. After 6 wrong guesses, the game ends and the answer is revealed.</p>
                  <p>You can type letters on your keyboard or click the letter buttons. Use the region dropdown to filter capitals by continent.</p>
                  <p>Score points by guessing correctly with fewer wrong attempts!</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-600 text-xs text-slate-500">
                  <p>Map data: OpenStreetMap contributors, Esri/ArcGIS</p>
                  <p>Country borders: Natural Earth via GitHub datasets</p>
                  <p className="mt-2">Mapitals - A geography guessing game</p>
                </div>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4" style={{ zIndex: 1000 }}>
            <div className="pointer-events-auto w-full max-w-4xl px-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 flex-1">
                  <p className="text-emerald-400 text-sm font-semibold mb-1">{isUSStatesMode ? 'State Capital' : 'Capital City'}</p>
                  <p className="text-xl sm:text-2xl font-mono tracking-widest text-white">
                    {isUSStatesMode 
                      ? (currentStateCapital ? (gameOver ? currentStateCapital.city : getDisplayText(currentStateCapital.city)) : '')
                      : (currentCapital ? (gameOver ? currentCapital.city : getDisplayText(currentCapital.city)) : '')}
                  </p>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 flex-1">
                  <p className="text-amber-400 text-sm font-semibold mb-1">{isUSStatesMode ? 'State' : 'Country'}</p>
                  <p className="text-xl sm:text-2xl font-mono tracking-widest text-white">
                    {isUSStatesMode
                      ? (currentStateCapital ? (gameOver ? currentStateCapital.state : getDisplayText(currentStateCapital.state)) : '')
                      : (currentCapital ? (gameOver ? currentCapital.country : getDisplayText(currentCapital.country)) : '')}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 py-2" aria-label="Guess a letter">
                <div className="flex flex-wrap justify-center gap-1">
                  {alphabet.map(letter => {
                    const isGuessed = guessedLetters.has(letter.toLowerCase())
                    const fullText = isUSStatesMode
                      ? (currentStateCapital ? `${currentStateCapital.city}${currentStateCapital.state}`.toLowerCase() : '')
                      : (currentCapital ? `${currentCapital.city}${currentCapital.country}`.toLowerCase() : '')
                    const isCorrect = fullText.includes(letter.toLowerCase())
                    
                    return (
                      <Button
                        key={letter}
                        onClick={() => handleGuess(letter)}
                        disabled={isGuessed || gameOver}
                        variant="outline"
                        className={`
                          h-7 w-7 sm:h-8 sm:w-8 p-0 font-bold text-xs sm:text-sm
                          ${isGuessed 
                            ? isCorrect 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'bg-red-600 border-red-600 text-white'
                            : 'bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600'
                          }
                        `}
                      >
                        {letter}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
