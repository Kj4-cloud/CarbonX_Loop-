import React from "react";

// Default project images for when farmer hasn't uploaded one
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop",
];

function getDefaultImage(id) {
  // Consistent image based on project ID hash
  const hash = (id || "")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_IMAGES[hash % DEFAULT_IMAGES.length];
}

export default function ProjectCard({
  project,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onInfo,
  index,
}) {
  // Map DB fields to display values
  const name = project.project_name || project.name || "Untitled Project";
  const location = project.location || "India";
  const price = Number(project.price_per_credit || project.price || 0);
  const credits =
    parseFloat(project.carbon_credits_generated || 0) -
    parseFloat(project.credits_sold || 0);
  const category = project.category || "agriculture";
  const plantType = project.plant_type || "";
  const farmerName = project.farmer_name || "Farmer";
  const isVerified = project.verification_status === "verified";
  const image =
    project.image_url || project.image || getDefaultImage(project.id);

  // Build a normalized project for cart/info callbacks
  const normalizedProject = {
    ...project,
    id: project.id,
    name,
    location,
    price,
    image,
    category,
    verified: isVerified,
    detail1Label: "Available Supply",
    detail1Value: `${credits.toFixed(0)} Credits`,
    detail2Label: "Plant Type",
    detail2Value:
      plantType || category.charAt(0).toUpperCase() + category.slice(1),
  };

  return (
    <div
      className="bg-white dark:bg-[#1a2b21] rounded-2xl overflow-hidden shadow-sm border border-[#e3e8e5] dark:border-[#2d4235] transition-transform hover:scale-[1.015] active:scale-[0.985] animate-slide-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Image */}
      <div className="relative h-48">
        <img
          className="w-full h-full object-cover"
          src={image}
          alt={name}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isVerified && (
            <span className="px-3 py-1 bg-[rgba(19,236,109,0.9)] text-[#0c1510] text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 backdrop-blur-sm">
              <span
                className="material-icons-round"
                style={{ fontSize: "0.875rem" }}
              >
                bolt
              </span>
              Verified
            </span>
          )}
          <span className="px-3 py-1 bg-[rgba(0,0,0,0.6)] text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
            {category}
          </span>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(project.id)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform border-none cursor-pointer"
        >
          <span
            className="material-icons-round"
            style={{
              fontSize: "1.125rem",
              color: isFavorite ? "#13ec6d" : "white",
            }}
          >
            {isFavorite ? "favorite" : "favorite_border"}
          </span>
        </button>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title + price row */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-[#0c1510] dark:text-[#f0f4f2]">
              {name}
            </h3>
            <p className="text-[#718b7c] text-xs font-semibold flex items-center gap-1 mt-0.5">
              <span
                className="material-icons-round"
                style={{ fontSize: "0.75rem" }}
              >
                location_on
              </span>
              {location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#13ec6d] font-black text-lg">
              ₹{price.toFixed(0)}
            </p>
            <p className="text-[#9db0a5] text-[10px] font-semibold uppercase">
              per tCO₂e
            </p>
          </div>
        </div>

        {/* Farmer name */}
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className="material-icons-round text-[#9db0a5]"
            style={{ fontSize: "0.875rem" }}
          >
            person
          </span>
          <span className="text-[#9db0a5] text-xs font-semibold">
            {farmerName}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#f0f4f2] dark:border-[rgba(45,66,53,0.5)] my-4">
          <div>
            <p className="text-[#9db0a5] text-[10px] font-bold uppercase tracking-tight">
              Available Supply
            </p>
            <p className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2]">
              {credits.toFixed(0)} Credits
            </p>
          </div>
          <div>
            <p className="text-[#9db0a5] text-[10px] font-bold uppercase tracking-tight">
              {plantType ? "Plant Type" : "Category"}
            </p>
            <p className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2]">
              {plantType ||
                category.charAt(0).toUpperCase() + category.slice(1)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            id={`buy-btn-${project.id}`}
            onClick={() => onAddToCart(normalizedProject)}
            className="flex-1 bg-[#13ec6d] hover:bg-[#0fc85d] text-[#0c1510] font-black py-3 rounded-xl transition-all hover:shadow-lg text-sm cursor-pointer border-none font-[Manrope]"
          >
            Purchase Credits
          </button>
          <button
            id={`info-btn-${project.id}`}
            onClick={() => onInfo(normalizedProject)}
            aria-label="Project info"
            className="w-12 h-12 flex items-center justify-center border-2 border-[#f0f4f2] dark:border-[#2d4235] rounded-xl text-[#718b7c] hover:border-[#13ec6d] hover:text-[#13ec6d] transition-colors bg-transparent cursor-pointer"
          >
            <span className="material-icons-round">info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
