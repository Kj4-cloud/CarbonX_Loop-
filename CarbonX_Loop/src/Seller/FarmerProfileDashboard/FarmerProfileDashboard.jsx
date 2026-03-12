import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import "./FarmerProfileDashboard.css";

const CROP_OPTIONS = [
  "Regenerative Corn",
  "Soybeans",
  "Cover Crops",
  "Agroforestry Mix",
  "Rice Paddy",
  "Millet",
  "Wheat",
  "Pulses",
  "Cotton",
  "Other",
];

const LAND_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBLqZfnT2b2qRBa3fVvntpgvoEfAo6Gjg1_6TGyxYvhViwj28Kdq8XcdmStJYNk9A-YXPTpZgt2S2lh2zDCyxeAN83rjQxZ8RjcqlfxqDMmbXyFhBSyYq2u142UHSYwHpFnt8iwvlYXk3UklGsknVeIqq1kQJMhttdNtlELKNRI2CERJn2MME8rKJB6uo0ARd1X5mRqDPwA2oXzR5pQrdt_v_mEnOKx_s-RucoR8MJdtlRYlwtD1hI1oedG114wr_93o7jNPCJxZa0B",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDCoa70KjVmd0zvt-N8-_egRf8n5hs21IUZ_dFFpxljocipkFvatfbGnqt-wpMThYiqYfHOG3JcIir4AQReTdfBF4aBRLJVzUGx_8mwq0blB6jxp6ELWR8FabfSvul018Q97g69xooFeEPTSUueKemnHiq1mv1yJdjCQFh51VcMCBKir2oFutkiIHZcUJ13YBeBy4AP41poCrSD0Hu2SGDfppjUEyXnhz6jVj-dL2DVs9J-62LL4-e6nYJouDuYlyzsaG9hwXE4xTse",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ07JsAfnXfLj0oYGgKO-VOQEZyTFZfGBi-J4J2vMzZYyMlUJoOCDBf0zUTXCBorlQ0ZZJy9DHNYxF1JFJxuGj_vP1MYg5YsUplbTl7S_jki8axLVtmBXVKixbTwaupKm-jaIav1y7BdKmfHlBDN7jQBIb4UnNTpRz3Ojv41-u6goi3cmazGYjNJ-dwp0_Smjp7yYIfnpu-yY04GJOwe15TiAniRb4on-28xlur5Qp6Nk27Izg2Udz4_axq_J-HYCvJR_giI65ZmVL",
];

const INITIAL_PARCELS = [
  {
    name: "North Ridge Field",
    acres: "42.5",
    crop: "Regenerative Corn",
    status: "high-yield",
    badge: "High Yield",
    suggestion: "Suggested: Add Cover Crop",
    suggestionIcon: "bolt",
    image: LAND_IMAGES[0],
  },
  {
    name: "East Willow Plot",
    acres: "18.2",
    crop: "Soybeans",
    status: "pending",
    badge: "Pending Review",
    suggestion: "Action: Upload Soil Report",
    suggestionIcon: "priority_high",
    image: LAND_IMAGES[0],
  },
];

/**
 * FarmerProfileDashboard - Main farmer dashboard showing profile,
 * tier status, portfolio value, revenue, and land assets.
 *
 * @param {Object} props.farmer - Farmer data object
 */
export default function FarmerProfileDashboard({ farmer }) {
  const { user, farmerProfile } = useAuth();
  const [parcels, setParcels] = useState(farmer?.parcels || INITIAL_PARCELS);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingParcels, setLoadingParcels] = useState(true);
  const [liveStats, setLiveStats] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    acres: "",
    crop: CROP_OPTIONS[0],
    latitude: "",
    longitude: "",
    soilType: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch parcels from Supabase on mount
  useEffect(() => {
    if (!user) return;
    const fetchParcels = async () => {
      setLoadingParcels(true);
      const { data, error } = await supabase
        .from("land_parcels")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });

      if (error && error.code !== "PGRST116") {
        console.warn("FarmerProfileDashboard: fetch error", error.message);
      }

      if (data && data.length > 0) {
        setParcels(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            acres: String(p.acres),
            crop: p.crop,
            status: p.status,
            badge:
              p.badge ||
              (p.status === "high-yield" ? "High Yield" : "Pending Review"),
            suggestion: p.suggestion || "Action: Upload Soil Report",
            suggestionIcon: p.suggestion_icon || "priority_high",
            image:
              p.image_url ||
              LAND_IMAGES[Math.floor(Math.random() * LAND_IMAGES.length)],
          })),
        );
      }
      setLoadingParcels(false);
    };
    fetchParcels();
  }, [user]);

  // Real-time subscription for farmer profile (portfolio & revenue updates)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("farmer-profile-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "farmer_profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // Update local live stats from the real-time payload
          if (payload.new) {
            setLiveStats({
              portfolio_credits: payload.new.portfolio_credits,
              total_revenue: payload.new.total_revenue,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const data = {
    name:
      farmerProfile?.full_name || user?.user_metadata?.full_name || "Farmer",
    id: farmerProfile?.farm_id ? `#${farmerProfile.farm_id}` : "#FC-00000",
    location: farmerProfile?.location || "Not set",
    bio:
      farmerProfile?.bio ||
      "Carbon credit farmer on the CarbonX platform. Update your profile to add a bio.",
    avatar:
      farmerProfile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXEoYif0xVu6BZOzx9BoCf-VVHnJNvFfMs9JIUVt8-HUpliUlKvo93-amT2JLkNVU8QoXGKnacK9bvzwh6iqtNGhjp1TeOLEEFYcUgzphhkpDZV-ERQuX1KFfJ6Ib7hx3TmiDungYt22s8bl5sdXtAL-JLr0eilwDI8mi_gFDubC_czn12PWAALLCvCVxgk3KCb8OVSnYQQyWpXr5K7E7DNinQVb7QnN5gkzoUxho6ciS68LAoiZayqibu5G8eLfvT95k2ibAHb94t",
    tier: {
      level: farmerProfile?.tier_level || 1,
      name: farmerProfile?.tier_name || "Starter",
      progress: farmerProfile?.tier_progress || 0,
      nextStatus: "Carbon Champion",
    },
    steps: [
      { num: 1, label: "Aadhaar KYC", completed: true },
      { num: 2, label: "Farm Mapping", completed: true },
      { num: 3, label: "Soil Health Card", completed: true },
      { num: 4, label: "FPO Verification", completed: false, isNext: true },
    ],
    portfolio: {
      credits: (
        liveStats?.portfolio_credits ??
        farmerProfile?.portfolio_credits ??
        0
      ).toLocaleString(),
      change: "+24.5% vs Last Year",
      projected: "Projected 1,500 credits by end of Q4",
    },
    revenue: {
      amount: (() => {
        const rev =
          liveStats?.total_revenue ?? farmerProfile?.total_revenue ?? 0;
        return `₹${Number(rev).toLocaleString("en-IN")}`;
      })(),
      payoutGoal: 86,
    },
    ...farmer,
  };

  const totalAcres = parcels
    .reduce((sum, p) => sum + parseFloat(p.acres || 0), 0)
    .toFixed(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Parcel name is required";
    if (!formData.acres || parseFloat(formData.acres) <= 0)
      errors.acres = "Enter valid acreage";
    if (!formData.crop) errors.crop = "Select a crop type";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const parcelImage =
      LAND_IMAGES[Math.floor(Math.random() * LAND_IMAGES.length)];

    // Save to Supabase
    const { data: insertedData, error: insertError } = await supabase
      .from("land_parcels")
      .insert({
        farmer_id: user.id,
        name: formData.name,
        acres: parseFloat(formData.acres),
        crop: formData.crop,
        status: "pending",
        badge: "Pending Review",
        suggestion: "Action: Upload Soil Report",
        suggestion_icon: "priority_high",
        latitude: formData.latitude,
        longitude: formData.longitude,
        soil_type: formData.soilType,
        description: formData.description,
        image_url: parcelImage,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving parcel:", insertError);
    }

    const newParcel = {
      id: insertedData?.id,
      name: formData.name,
      acres: parseFloat(formData.acres).toFixed(1),
      crop: formData.crop,
      status: "pending",
      badge: "Pending Review",
      suggestion: "Action: Upload Soil Report",
      suggestionIcon: "priority_high",
      image: parcelImage,
      latitude: formData.latitude,
      longitude: formData.longitude,
      soilType: formData.soilType,
      description: formData.description,
    };

    setParcels((prev) => [newParcel, ...prev]);
    setShowModal(false);
    setShowSuccess(true);
    setFormData({
      name: "",
      acres: "",
      crop: CROP_OPTIONS[0],
      latitude: "",
      longitude: "",
      soilType: "",
      description: "",
    });
    setFormErrors({});

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
  };

  return (
    <>
      <main className="fpd-main">
        <div className="fpd-grid">
          {/* ===== Profile Card ===== */}
          <section className="fpd-profile-card animate-fade-in">
            <div className="fpd-profile-row">
              <div className="fpd-avatar-wrap">
                <div
                  className="fpd-avatar"
                  style={{ backgroundImage: `url('${data.avatar}')` }}
                />
                <div className="fpd-verified-badge">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--white)",
                      fontWeight: 700,
                    }}
                  >
                    verified
                  </span>
                </div>
              </div>
              <div className="fpd-profile-info">
                <div className="fpd-profile-name-row">
                  <h2 className="fpd-name">{data.name}</h2>
                  <span className="badge badge-slate">ID: {data.id}</span>
                </div>
                <div className="fpd-location">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "0.875rem" }}
                  >
                    location_on
                  </span>
                  <span>{data.location}</span>
                </div>
                <p className="fpd-bio">{data.bio}</p>
              </div>
            </div>
          </section>

          {/* ===== Tier Card ===== */}
    

          {/* ===== Portfolio & Revenue Row ===== */}
          <div
            className="fpd-stats-row animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Portfolio */}
            <div className="fpd-portfolio-card">
              <div className="fpd-portfolio-bg">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "7.5rem" }}
                >
                  trending_up
                </span>
              </div>
              <div className="fpd-portfolio-content">
                <div className="fpd-portfolio-header">
                  <span className="fpd-portfolio-label">Portfolio Value</span>
                  <span className="fpd-portfolio-badge">
                    {data.portfolio.change}
                  </span>
                </div>
                <div className="fpd-portfolio-credits">
                  <span className="fpd-credits-num">
                    {data.portfolio.credits}
                  </span>
                  <span className="fpd-credits-unit">Credits</span>
                </div>
                <div className="fpd-mini-chart">
                  <div
                    className="fpd-bar"
                    style={{ height: "40%", background: "var(--slate-700)" }}
                  ></div>
                  <div
                    className="fpd-bar"
                    style={{ height: "60%", background: "var(--slate-700)" }}
                  ></div>
                  <div
                    className="fpd-bar"
                    style={{ height: "50%", background: "var(--slate-700)" }}
                  ></div>
                  <div
                    className="fpd-bar"
                    style={{ height: "80%", background: "var(--slate-700)" }}
                  ></div>
                  <div
                    className="fpd-bar"
                    style={{ height: "90%", background: "var(--primary)" }}
                  ></div>
                  <div
                    className="fpd-bar"
                    style={{ height: "100%", background: "var(--primary)" }}
                  ></div>
                </div>
                <p className="fpd-portfolio-projected">
                  {data.portfolio.projected}
                </p>
              </div>
            </div>

            {/* Revenue */}
            <div className="fpd-revenue-card">
              <div className="fpd-revenue-header">
                <span className="fpd-revenue-label">
                  Total Revenue Generated
                </span>
                <div className="fpd-revenue-icon">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "var(--primary)" }}
                  >
                    payments
                  </span>
                </div>
              </div>
              <div className="fpd-revenue-amount">{data.revenue.amount}</div>
              <div className="fpd-payout-section">
                <div className="fpd-payout-info">
                  <div className="fpd-payout-labels">
                    <span>Payout Goal</span>
                    <span>{data.revenue.payoutGoal}%</span>
                  </div>
                  <div className="progress-bar-sm">
                    <div
                      className="progress-bar-sm-fill"
                      style={{ width: `${data.revenue.payoutGoal}%` }}
                    ></div>
                  </div>
                </div>
                <button className="fpd-payout-btn">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "0.875rem" }}
                  >
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ===== Active Land Assets ===== */}
        </div>
      </main>

      {/* ===== Success Toast ===== */}
      {showSuccess && (
        <div className="fpd-toast animate-slide-up">
          <span
            className="material-symbols-outlined"
            style={{ color: "var(--primary)", fontSize: "1.25rem" }}
          >
            check_circle
          </span>
          <span>Parcel registered successfully!</span>
        </div>
      )}

      {/* ===== Register Parcel Modal ===== */}
      {showModal && (
        <div className="fpd-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="fpd-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="fpd-modal-header">
              <div className="fpd-modal-header-left">
                <div className="fpd-modal-icon">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "var(--primary)", fontSize: "1.25rem" }}
                  >
                    add_location_alt
                  </span>
                </div>
                <div>
                  <h2 className="fpd-modal-title">Register New Parcel</h2>
                  <p className="fpd-modal-subtitle">
                    Add a new land parcel to your portfolio
                  </p>
                </div>
              </div>
              <button className="fpd-modal-close" onClick={handleCloseModal}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  close
                </span>
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleSubmit} className="fpd-modal-form">
              {/* Parcel Name */}
              <div className="fpd-form-group">
                <label className="fpd-form-label">
                  <span className="material-symbols-outlined fpd-form-label-icon">
                    badge
                  </span>
                  Parcel Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. South Valley Field"
                  className={`fpd-form-input ${formErrors.name ? "error" : ""}`}
                />
                {formErrors.name && (
                  <span className="fpd-form-error">{formErrors.name}</span>
                )}
              </div>

              {/* Acres & Crop Row */}
              <div className="fpd-form-row">
                <div className="fpd-form-group">
                  <label className="fpd-form-label">
                    <span className="material-symbols-outlined fpd-form-label-icon">
                      straighten
                    </span>
                    Area (Acres) *
                  </label>
                  <input
                    type="number"
                    name="acres"
                    value={formData.acres}
                    onChange={handleInputChange}
                    placeholder="e.g. 25.0"
                    min="0.1"
                    step="0.1"
                    className={`fpd-form-input ${formErrors.acres ? "error" : ""}`}
                  />
                  {formErrors.acres && (
                    <span className="fpd-form-error">{formErrors.acres}</span>
                  )}
                </div>
                <div className="fpd-form-group">
                  <label className="fpd-form-label">
                    <span className="material-symbols-outlined fpd-form-label-icon">
                      grass
                    </span>
                    Crop Type *
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    className={`fpd-form-input fpd-form-select ${formErrors.crop ? "error" : ""}`}
                  >
                    {CROP_OPTIONS.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </select>
                  {formErrors.crop && (
                    <span className="fpd-form-error">{formErrors.crop}</span>
                  )}
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="fpd-form-section-title">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem", color: "var(--primary)" }}
                >
                  my_location
                </span>
                GPS Coordinates (Optional)
              </div>
              <div className="fpd-form-row">
                <div className="fpd-form-group">
                  <label className="fpd-form-label">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 11.4102"
                    className="fpd-form-input"
                  />
                </div>
                <div className="fpd-form-group">
                  <label className="fpd-form-label">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 76.6950"
                    className="fpd-form-input"
                  />
                </div>
              </div>
              {/* Soil Type */}
              <div className="fpd-form-group">
                <label className="fpd-form-label">
                  <span className="material-symbols-outlined fpd-form-label-icon">
                    landscape
                  </span>
                  Soil Type
                </label>
                <input
                  type="text"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  placeholder="e.g. Red Laterite, Black Cotton, Alluvial"
                  className="fpd-form-input"
                />
              </div>

              {/* Description */}
              <div className="fpd-form-group">
                <label className="fpd-form-label">
                  <span className="material-symbols-outlined fpd-form-label-icon">
                    description
                  </span>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the land parcel, current vegetation, irrigation method..."
                  rows="3"
                  className="fpd-form-input fpd-form-textarea"
                />
              </div>

              {/* Info Note */}
              <div className="fpd-form-info-note">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem", color: "var(--primary)" }}
                >
                  info
                </span>
                <span>
                  New parcels are submitted for review. You'll be notified once
                  your parcel is verified and activated.
                </span>
              </div>

              {/* Buttons */}
              <div className="fpd-modal-actions">
                <button
                  type="button"
                  className="fpd-modal-btn-cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="fpd-modal-btn-submit">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.125rem" }}
                  >
                    add_circle
                  </span>
                  Register Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
