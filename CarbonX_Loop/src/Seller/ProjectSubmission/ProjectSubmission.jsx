import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import VegetationMap from "./VegetationMap";
import "./ProjectSubmission.css";
import "../PhotoVerification/PhotoVerification.css";

const CATEGORY_OPTIONS = [
  { value: "agriculture", label: "Agriculture", icon: "agriculture" },
  { value: "reforestation", label: "Reforestation", icon: "park" },
  { value: "renewable", label: "Renewable Energy", icon: "wb_sunny" },
];

const PLANT_TYPES = [
  "Wheat",
  "Rice",
  "Corn",
  "Soybeans",
  "Millet",
  "Teak",
  "Neem",
  "Bamboo",
  "Mangrove",
  "Eucalyptus",
  "Cover Crops",
  "Agroforestry Mix",
  "Mixed Forest",
  "Other",
];

const CARBON_RATE = 0.02; // tonnes CO₂ per plant per year

export default function ProjectSubmission() {
  const { user, farmerProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    location: "",
    category: "agriculture",
    landSize: "",
    plantType: PLANT_TYPES[0],
    plantDensity: "100",
    pricePerCredit: "1200",
  });
  const [formErrors, setFormErrors] = useState({});

  // ---- Photo Verification State ----
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [ndviData, setNdviData] = useState(null);

  // ---- Unique Land ID Verification State ----
  const [landId, setLandId] = useState("");
  const [landIdVerified, setLandIdVerified] = useState(false);
  const [landIdVerifying, setLandIdVerifying] = useState(false);
  const [landIdError, setLandIdError] = useState("");

  // Fetch farmer's projects
  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("farmer_projects")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });

      if (error && error.code !== "PGRST116") {
        console.warn("ProjectSubmission: fetch error", error.message);
      }
      setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  // Carbon credit calculator
  const calcCredits = () => {
    const land = parseFloat(formData.landSize) || 0;
    const density = parseInt(formData.plantDensity) || 0;
    return (land * density * CARBON_RATE).toFixed(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.projectName.trim())
      errors.projectName = "Project name is required";
    if (!formData.landSize || parseFloat(formData.landSize) <= 0)
      errors.landSize = "Enter valid land size";
    if (!formData.plantDensity || parseInt(formData.plantDensity) <= 0)
      errors.plantDensity = "Enter valid plant density";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!landIdVerified) errors.landId = "Land ID must be verified";
    return errors;
  };

  // ---- Photo Verification Helpers ----
  const getGpsLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const openCamera = async () => {
    setCapturedImage(null);
    setShowCamera(true);
    getGpsLocation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera error, falling back to file input:", err.message);
      setShowCamera(false);
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    getGpsLocation();
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
      setShowCamera(true);
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const closeCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedImage(null);
    setGpsLocation(null);
  };

  // Upload captured photo linked to a project
  const uploadVerificationPhoto = async (projectId, projectName) => {
    if (!capturedImage || !user) return;
    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("photo-verifications")
        .upload(filePath, blob, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("photo-verifications")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      const now = new Date();
      const coords = gpsLocation
        ? `${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}`
        : "";

      await supabase.from("photo_verifications").insert({
        farmer_id: user.id,
        title: projectName || "Land Verification",
        image_url: publicUrl,
        file_size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        capture_time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        capture_date: now.toISOString().split("T")[0],
        gps_fix: !!gpsLocation,
        coordinates: coords,
        status: "pending",
        project_id: projectId,
      });
    } catch (err) {
      console.error("Photo upload error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    const farmerName =
      farmerProfile?.full_name || user?.user_metadata?.full_name || "Farmer";

    const { data: inserted, error } = await supabase
      .from("farmer_projects")
      .insert({
        farmer_id: user.id,
        farmer_name: farmerName,
        project_name: formData.projectName,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        land_size_acres: parseFloat(formData.landSize),
        plant_type: formData.plantType,
        plant_density_per_acre: parseInt(formData.plantDensity),
        price_per_credit: parseFloat(formData.pricePerCredit),
        land_id: landId,
        is_listed: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      setSubmitting(false);
      return;
    }

    // Upload verification photo if captured
    if (capturedImage && inserted) {
      await uploadVerificationPhoto(inserted.id, inserted.project_name);
    }

    setProjects((prev) => [inserted, ...prev]);
    setShowModal(false);
    setSubmitting(false);
    setShowSuccess(true);
    setFormData({
      projectName: "",
      description: "",
      location: "",
      category: "agriculture",
      landSize: "",
      plantType: PLANT_TYPES[0],
      plantDensity: "100",
      pricePerCredit: "1200",
    });
    setFormErrors({});
    setCapturedImage(null);
    setGpsLocation(null);
    setShowCamera(false);
    setLandId("");
    setLandIdVerified(false);
    setLandIdError("");
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleListed = async (project) => {
    const newVal = !project.is_listed;
    await supabase
      .from("farmer_projects")
      .update({ is_listed: newVal, updated_at: new Date().toISOString() })
      .eq("id", project.id);
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, is_listed: newVal } : p)),
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "var(--primary)";
      case "pending":
        return "var(--amber-500, #f59e0b)";
      case "rejected":
        return "#ef4444";
      default:
        return "var(--slate-400)";
    }
  };

  return (
    <>
      <main className="ps-layout">
        {/* Header */}
        <header className="ps-header">
          <div className="ps-header-info">
            <h1 className="ps-header-title">My Carbon Projects</h1>
            <p className="ps-header-subtitle">
              Create & Manage Carbon Credit Projects
            </p>
          </div>
        </header>

        <div className="ps-main">
          <div className="ps-main-inner">
            {/* Stats Summary */}
            <div className="ps-stats-row">
              <div className="ps-stat-card">
                <div
                  className="ps-stat-icon"
                  style={{ background: "rgba(19,236,109,0.1)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "var(--primary)", fontSize: "1.5rem" }}
                  >
                    forest
                  </span>
                </div>
                <div>
                  <p className="ps-stat-value">{projects.length}</p>
                  <p className="ps-stat-label">Total Projects</p>
                </div>
              </div>
              <div className="ps-stat-card">
                <div
                  className="ps-stat-icon"
                  style={{ background: "rgba(59,130,246,0.1)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "var(--blue-500, #3b82f6)",
                      fontSize: "1.5rem",
                    }}
                  >
                    eco
                  </span>
                </div>
                <div>
                  <p className="ps-stat-value">
                    {projects
                      .reduce(
                        (sum, p) =>
                          sum + (parseFloat(p.carbon_credits_generated) || 0),
                        0,
                      )
                      .toFixed(0)}
                  </p>
                  <p className="ps-stat-label">Total Credits</p>
                </div>
              </div>
              <div className="ps-stat-card">
                <div
                  className="ps-stat-icon"
                  style={{ background: "rgba(245,158,11,0.1)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "var(--amber-500, #f59e0b)",
                      fontSize: "1.5rem",
                    }}
                  >
                    storefront
                  </span>
                </div>
                <div>
                  <p className="ps-stat-value">
                    {projects.filter((p) => p.is_listed).length}
                  </p>
                  <p className="ps-stat-label">Listed</p>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              className="ps-create-btn"
              onClick={() => setShowModal(true)}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.25rem" }}
              >
                add_circle
              </span>
              Create New Project
            </button>

            {/* Project List */}
            <div className="ps-projects-header">
              <h3>Your Projects</h3>
              <span className="ps-projects-count">
                {projects.length} projects
              </span>
            </div>

            {loading ? (
              <div className="ps-loading">
                <span
                  className="material-symbols-outlined animate-spin"
                  style={{ fontSize: "2rem", color: "var(--primary)" }}
                >
                  progress_activity
                </span>
                <p>Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="ps-empty">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "3rem", color: "var(--slate-300)" }}
                >
                  eco
                </span>
                <h4>No projects yet</h4>
                <p>
                  Create your first carbon credit project to start generating
                  credits.
                </p>
              </div>
            ) : (
              <div className="ps-projects-list">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="ps-project-card animate-fade-in"
                  >
                    <div className="ps-project-card-header">
                      <div className="ps-project-card-title-row">
                        <div>
                          <h4 className="ps-project-name">
                            {project.project_name}
                          </h4>
                          <p className="ps-project-location">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "0.75rem" }}
                            >
                              location_on
                            </span>
                            {project.location || "No location"}
                          </p>
                        </div>
                        <span
                          className="ps-project-status-badge"
                          style={{
                            background: `${getStatusColor(project.verification_status)}20`,
                            color: getStatusColor(project.verification_status),
                          }}
                        >
                          {project.verification_status || "pending"}
                        </span>
                      </div>
                    </div>

                    <div className="ps-project-details-grid">
                      <div className="ps-project-detail">
                        <span className="ps-detail-label">Land Size</span>
                        <span className="ps-detail-value">
                          {Number(project.land_size_acres).toFixed(1)} acres
                        </span>
                      </div>
                      <div className="ps-project-detail">
                        <span className="ps-detail-label">Plant Type</span>
                        <span className="ps-detail-value">
                          {project.plant_type || "–"}
                        </span>
                      </div>
                      <div className="ps-project-detail">
                        <span className="ps-detail-label">Density / Acre</span>
                        <span className="ps-detail-value">
                          {project.plant_density_per_acre} plants
                        </span>
                      </div>
                      <div className="ps-project-detail highlight">
                        <span className="ps-detail-label">Carbon Credits</span>
                        <span className="ps-detail-value accent">
                          {parseFloat(project.carbon_credits_generated).toFixed(
                            1,
                          )}{" "}
                          tCO₂e
                        </span>
                      </div>
                    </div>

                    <div className="ps-project-footer">
                      <div className="ps-project-price">
                        ₹
                        {Number(project.price_per_credit).toLocaleString(
                          "en-IN",
                        )}{" "}
                        / credit
                      </div>
                      <button
                        className={`ps-list-toggle ${project.is_listed ? "listed" : ""}`}
                        onClick={() => toggleListed(project)}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {project.is_listed ? "visibility" : "visibility_off"}
                        </span>
                        {project.is_listed ? "Listed" : "Unlisted"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Toast */}
      {showSuccess && (
        <div className="ps-toast animate-slide-up">
          <span
            className="material-symbols-outlined"
            style={{ color: "var(--primary)", fontSize: "1.25rem" }}
          >
            check_circle
          </span>
          <span>Project created successfully! Carbon credits generated.</span>
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="ps-modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="ps-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ps-modal-header">
              <div className="ps-modal-header-left">
                <div className="ps-modal-icon">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "var(--primary)", fontSize: "1.25rem" }}
                  >
                    eco
                  </span>
                </div>
                <div>
                  <h2 className="ps-modal-title">Create Carbon Project</h2>
                  <p className="ps-modal-subtitle">
                    Generate carbon credits from your land
                  </p>
                </div>
              </div>
              <button
                className="ps-modal-close"
                onClick={() => setShowModal(false)}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="ps-modal-form">
              {/* Project Name */}
              <div className="ps-form-group">
                <label className="ps-form-label">
                  <span className="material-symbols-outlined ps-form-label-icon">
                    badge
                  </span>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="e.g. Green Valley Reforestation"
                  className={`ps-form-input ${formErrors.projectName ? "error" : ""}`}
                />
                {formErrors.projectName && (
                  <span className="ps-form-error">
                    {formErrors.projectName}
                  </span>
                )}
              </div>

              {/* Unique Land ID */}
              <div className="ps-form-group">
                <label className="ps-form-label">
                  <span className="material-symbols-outlined ps-form-label-icon">
                    verified_user
                  </span>
                  Unique Land ID *
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--slate-400)",
                      fontSize: "0.625rem",
                      textTransform: "none",
                      letterSpacing: 0,
                      marginLeft: "0.5rem",
                    }}
                  >
                    Land ownership proof
                  </span>
                </label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      type="text"
                      value={landId}
                      onChange={(e) => {
                        setLandId(e.target.value);
                        if (landIdVerified) {
                          setLandIdVerified(false);
                          setLandIdError("");
                        }
                        if (formErrors.landId) {
                          setFormErrors((prev) => ({ ...prev, landId: "" }));
                        }
                      }}
                      placeholder="e.g. DLRC-2024-KA-001234"
                      className={`ps-form-input ${formErrors.landId ? "error" : ""}`}
                      disabled={landIdVerified}
                      style={landIdVerified ? {
                        background: "rgba(19,236,109,0.05)",
                        borderColor: "var(--primary)",
                      } : {}}
                    />
                    {landIdVerified && (
                      <span
                        className="material-symbols-outlined"
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--primary)",
                          fontSize: "1.25rem",
                        }}
                      >
                        verified
                      </span>
                    )}
                  </div>
                  {!landIdVerified && (
                    <button
                      type="button"
                      disabled={landId.trim().length < 5 || landIdVerifying}
                      onClick={async () => {
                        setLandIdVerifying(true);
                        setLandIdError("");
                        // Simulate verification API call
                        await new Promise((r) => setTimeout(r, 1500));
                        if (landId.trim().length >= 5) {
                          setLandIdVerified(true);
                          setLandIdError("");
                        } else {
                          setLandIdError("Invalid Land ID. Please check and try again.");
                        }
                        setLandIdVerifying(false);
                      }}
                      style={{
                        padding: "0.625rem 1.25rem",
                        borderRadius: "0.75rem",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        cursor: landId.trim().length >= 5 && !landIdVerifying ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        whiteSpace: "nowrap",
                        background: landId.trim().length >= 5 && !landIdVerifying ? "var(--primary)" : "var(--slate-200, #e2e8f0)",
                        color: landId.trim().length >= 5 && !landIdVerifying ? "#1a3324" : "var(--slate-400, #94a3b8)",
                        transition: "all 0.2s",
                      }}
                    >
                      {landIdVerifying ? (
                        <>
                          <span
                            className="material-symbols-outlined animate-spin"
                            style={{ fontSize: "1rem" }}
                          >
                            progress_activity
                          </span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem" }}
                          >
                            fact_check
                          </span>
                          Verify
                        </>
                      )}
                    </button>
                  )}
                </div>
                {landIdError && (
                  <span className="ps-form-error">{landIdError}</span>
                )}
                {formErrors.landId && !landIdError && (
                  <span className="ps-form-error">{formErrors.landId}</span>
                )}
                {landIdVerified && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      marginTop: "0.375rem",
                      color: "var(--primary)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "0.875rem" }}
                    >
                      check_circle
                    </span>
                    Land ownership verified successfully
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="ps-form-group">
                <label className="ps-form-label">
                  <span className="material-symbols-outlined ps-form-label-icon">
                    location_on
                  </span>
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Western Ghats, Karnataka"
                  className={`ps-form-input ${formErrors.location ? "error" : ""}`}
                />
                {formErrors.location && (
                  <span className="ps-form-error">{formErrors.location}</span>
                )}
              </div>

              {/* Category */}
              <div className="ps-form-group">
                <label className="ps-form-label">
                  <span className="material-symbols-outlined ps-form-label-icon">
                    category
                  </span>
                  Category
                </label>
                <div className="ps-category-pills">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      className={`ps-category-pill ${formData.category === cat.value ? "active" : ""}`}
                      onClick={() =>
                        setFormData((p) => ({ ...p, category: cat.value }))
                      }
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1rem" }}
                      >
                        {cat.icon}
                      </span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Size & Plant Type */}
              <div className="ps-form-row">
                <div className="ps-form-group">
                  <label className="ps-form-label">
                    <span className="material-symbols-outlined ps-form-label-icon">
                      straighten
                    </span>
                    Land Size (Acres) *
                  </label>
                  <input
                    type="number"
                    name="landSize"
                    value={formData.landSize}
                    onChange={handleInputChange}
                    placeholder="e.g. 10"
                    min="0.1"
                    step="0.1"
                    className={`ps-form-input ${formErrors.landSize ? "error" : ""}`}
                  />
                  {formErrors.landSize && (
                    <span className="ps-form-error">{formErrors.landSize}</span>
                  )}
                </div>
                <div className="ps-form-group">
                  <label className="ps-form-label">
                    <span className="material-symbols-outlined ps-form-label-icon">
                      grass
                    </span>
                    Plant Type
                  </label>
                  <select
                    name="plantType"
                    value={formData.plantType}
                    onChange={handleInputChange}
                    className="ps-form-input ps-form-select"
                  >
                    {PLANT_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Plant Density & Price */}
              <div className="ps-form-row">
                <div className="ps-form-group">
                  <label className="ps-form-label">
                    <span className="material-symbols-outlined ps-form-label-icon">
                      grid_on
                    </span>
                    Plants per Acre *
                  </label>
                  <input
                    type="number"
                    name="plantDensity"
                    value={formData.plantDensity}
                    onChange={handleInputChange}
                    placeholder="e.g. 100"
                    min="1"
                    className={`ps-form-input ${formErrors.plantDensity ? "error" : ""}`}
                  />
                  {formErrors.plantDensity && (
                    <span className="ps-form-error">
                      {formErrors.plantDensity}
                    </span>
                  )}
                </div>
                <div className="ps-form-group">
                  <label className="ps-form-label">
                    <span className="material-symbols-outlined ps-form-label-icon">
                      currency_rupee
                    </span>
                    Price / Credit (₹)
                  </label>
                  <input
                    type="number"
                    name="pricePerCredit"
                    value={formData.pricePerCredit}
                    onChange={handleInputChange}
                    placeholder="e.g. 1200"
                    min="1"
                    className="ps-form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="ps-form-group">
                <label className="ps-form-label">
                  <span className="material-symbols-outlined ps-form-label-icon">
                    description
                  </span>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your carbon credit project, land practices, vegetation type..."
                  rows="3"
                  className="ps-form-input ps-form-textarea"
                />
              </div>

              {/* ===== Photo Verification Section ===== */}
              <div className="ps-photo-verify-section">
                <label className="ps-form-label">
                  <span className="material-symbols-outlined ps-form-label-icon">
                    photo_camera
                  </span>
                  Photo Verification
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--slate-400)",
                      fontSize: "0.625rem",
                      textTransform: "none",
                      letterSpacing: 0,
                      marginLeft: "0.5rem",
                    }}
                  >
                    Optional
                  </span>
                </label>

                {!capturedImage ? (
                  <div className="ps-photo-capture-box" onClick={openCamera}>
                    <div className="ps-photo-capture-icon">
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "var(--primary)", fontSize: "1.5rem" }}
                      >
                        add_a_photo
                      </span>
                    </div>
                    <div>
                      <p className="ps-photo-capture-label">
                        Tap to Capture Photo
                      </p>
                      <p className="ps-photo-capture-hint">
                        Take a photo of your land Document for verification.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="ps-photo-preview-wrap">
                    <img
                      src={capturedImage}
                      alt="Captured verification"
                      className="ps-photo-preview-img"
                    />
                    <div className="ps-photo-preview-overlay">
                      {gpsLocation && (
                        <div className="ps-photo-gps-badge">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "0.875rem" }}
                          >
                            location_on
                          </span>
                          {gpsLocation.lat.toFixed(4)},{" "}
                          {gpsLocation.lng.toFixed(4)}
                        </div>
                      )}
                      <button
                        type="button"
                        className="ps-photo-remove-btn"
                        onClick={() => {
                          setCapturedImage(null);
                          setGpsLocation(null);
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1rem" }}
                        >
                          close
                        </span>
                      </button>
                    </div>
                    <div className="ps-photo-preview-info">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1rem", color: "var(--primary)" }}
                      >
                        check_circle
                      </span>
                      <span>
                        Photo captured{gpsLocation ? " with GPS" : ""}
                      </span>
                      <button
                        type="button"
                        className="ps-photo-retake-link"
                        onClick={openCamera}
                      >
                        Retake
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </div>

              {/* ===== Vegetation Analysis Section ===== */}
              <VegetationMap
                gpsLocation={gpsLocation}
                landSize={formData.landSize}
                onResult={(result) => setNdviData(result)}
              />

              {/* Carbon Credit Preview */}
              <div className="ps-credit-preview">
                <div className="ps-credit-preview-icon">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.5rem", color: "var(--primary)" }}
                  >
                    eco
                  </span>
                </div>
                <div className="ps-credit-preview-info">
                  <p className="ps-credit-preview-label">
                    Estimated Carbon Credits
                  </p>
                  <p className="ps-credit-preview-value">
                    {calcCredits()} <span>tCO₂e / year</span>
                  </p>
                  <p className="ps-credit-preview-formula">
                    {formData.landSize || "0"} acres ×{" "}
                    {formData.plantDensity || "0"} plants × {CARBON_RATE} rate
                  </p>
                </div>
                <div className="ps-credit-preview-revenue">
                  <p className="ps-credit-preview-rev-label">Est. Revenue</p>
                  <p className="ps-credit-preview-rev-value">
                    ₹
                    {(
                      parseFloat(calcCredits()) *
                      parseFloat(formData.pricePerCredit || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="ps-modal-actions">
                <button
                  type="button"
                  className="ps-modal-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ps-modal-btn-submit"
                  disabled={submitting}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.125rem" }}
                  >
                    {submitting ? "progress_activity" : "eco"}
                  </span>
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Camera Capture Modal (reuses PhotoVerification styles) ===== */}
      {showCamera && (
        <div className="pv-camera-backdrop">
          <div className="pv-camera-modal animate-slide-up">
            <div className="pv-camera-header">
              <h3>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem", verticalAlign: "middle" }}
                >
                  photo_camera
                </span>{" "}
                Capture Photo
              </h3>
              <button className="pv-camera-close" onClick={closeCamera}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="pv-camera-body">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="pv-camera-video"
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <button className="pv-capture-btn" onClick={capturePhoto}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "2rem" }}
                    >
                      camera
                    </span>
                  </button>
                </>
              ) : (
                <div className="pv-preview-container">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="pv-preview-img"
                  />
                </div>
              )}

              {/* Location Status */}
              <div className="pv-location-status">
                {gettingLocation ? (
                  <>
                    <span
                      className="material-symbols-outlined animate-spin"
                      style={{ fontSize: "1rem", color: "var(--primary)" }}
                    >
                      progress_activity
                    </span>
                    <span>Getting GPS location...</span>
                  </>
                ) : gpsLocation ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1rem", color: "var(--primary)" }}
                    >
                      location_on
                    </span>
                    <span>
                      {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "1rem",
                        color: "var(--amber-500, #f59e0b)",
                      }}
                    >
                      location_off
                    </span>
                    <span>GPS unavailable</span>
                  </>
                )}
              </div>
            </div>

            {capturedImage && (
              <div className="pv-camera-actions">
                <button
                  className="pv-retake-btn"
                  onClick={() => {
                    setCapturedImage(null);
                    openCamera();
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    restart_alt
                  </span>
                  Retake
                </button>
                <button
                  className="pv-upload-btn"
                  onClick={() => {
                    setShowCamera(false);
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    check_circle
                  </span>
                  Use Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
