// Project data - mirrors original app.js
export const projects = [
  {
    id: 1,
    name: "Western Ghats Reforestation",
    location: "Western Ghats, Karnataka",
    price: 1535,
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop",
    category: "reforestation",
    detail1Label: "Available Supply",
    detail1Value: "24,500 Credits",
    detail2Label: "Project Vintage",
    detail2Value: "2023 - 2024",
    verified: true,
  },
  {
    id: 2,
    name: "Sustainable Rice Farming",
    location: "Sundarbans, West Bengal",
    price: 1012,
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop",
    category: "agriculture",
    detail1Label: "Available Supply",
    detail1Value: "118,200 Credits",
    detail2Label: "Project Type",
    detail2Value: "Methane Avoidance",
    verified: true,
  },
  {
    id: 3,
    name: "Rajasthan Wind Power",
    location: "Jaisalmer, Rajasthan",
    price: 813,
    image:
      "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop",
    category: "renewable",
    detail1Label: "Available Supply",
    detail1Value: "342,000 Credits",
    detail2Label: "Registry",
    detail2Value: "Gold Standard",
    verified: true,
  },
  {
    id: 4,
    name: "Mangrove Conservation",
    location: "Pichavaram, Tamil Nadu",
    price: 1307,
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
    category: "reforestation",
    detail1Label: "Available Supply",
    detail1Value: "67,300 Credits",
    detail2Label: "Project Vintage",
    detail2Value: "2024 - 2025",
    verified: true,
  },
  {
    id: 5,
    name: "Solar Energy Initiative",
    location: "Pavagada, Karnataka",
    price: 946,
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
    category: "renewable",
    detail1Label: "Available Supply",
    detail1Value: "225,800 Credits",
    detail2Label: "Registry",
    detail2Value: "Verra VCS",
    verified: true,
  },
  {
    id: 6,
    name: "Organic Tea Farming",
    location: "Munnar, Kerala",
    price: 1153,
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop",
    category: "agriculture",
    detail1Label: "Available Supply",
    detail1Value: "89,450 Credits",
    detail2Label: "Project Type",
    detail2Value: "Soil Carbon",
    verified: true,
  },
];

export const FILTERS = [
  { key: "all", label: "All Projects", icon: "category" },
  { key: "reforestation", label: "Reforestation", icon: "park" },
  { key: "renewable", label: "Renewable Energy", icon: "wb_sunny" },
  { key: "agriculture", label: "Agriculture", icon: "agriculture" },
];
