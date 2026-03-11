import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import "./PhotoVerification.css";

export default function PhotoVerification() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch photos & projects
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [photosRes, projectsRes] = await Promise.all([
        supabase
          .from("photo_verifications")
          .select("*")
          .eq("farmer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("farmer_projects")
          .select("id, project_name")
          .eq("farmer_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (photosRes.data) setPhotos(photosRes.data);
      if (projectsRes.data) {
        setProjects(projectsRes.data);
        if (projectsRes.data.length > 0)
          setSelectedProject(projectsRes.data[0].id);
      }
      setLoading(false);
    };
    fetchData();

    // Real-time subscription for photos
    const channel = supabase
      .channel("photo-verifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "photo_verifications",
          filter: `farmer_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPhotos((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setPhotos((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get GPS location
  const getLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Open Camera
  const openCamera = async () => {
    setCapturedImage(null);
    setShowCamera(true);
    getLocation();
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

  // Capture photo from camera
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

  // Handle file input (fallback)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    getLocation();
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
      setShowCamera(true);
    };
    reader.readAsDataURL(file);
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Close camera modal
  const closeCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedImage(null);
    setLocation(null);
  };

  // Upload photo
  const uploadPhoto = async () => {
    if (!capturedImage || !user) return;
    setUploading(true);

    try {
      // Convert data URL to blob
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}.jpg`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("photo-verifications")
        .upload(filePath, blob, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("photo-verifications")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      const now = new Date();
      const coords = location
        ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
        : "";

      // Insert into DB
      const { error: dbError } = await supabase
        .from("photo_verifications")
        .insert({
          farmer_id: user.id,
          title: selectedProject
            ? projects.find((p) => p.id === selectedProject)?.project_name ||
              "Land Verification"
            : "Land Verification",
          image_url: publicUrl,
          file_size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
          capture_time: now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          capture_date: now.toISOString().split("T")[0],
          gps_fix: !!location,
          coordinates: coords,
          status: "pending",
          project_id: selectedProject || null,
        });

      if (dbError) throw dbError;

      closeCamera();
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  const getStatusClass = (status) => {
    if (status === "verified") return "verified";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  return (
    <div className="pv-content">
      {/* Header */}
      <header className="pv-header">
        <div className="pv-header-left">
          <h1 className="pv-header-title">Photo Verification</h1>
        </div>
      </header>

      <main className="pv-main">
        {/* Intro */}
        <section className="pv-intro">
          <h2 className="pv-intro-title">Capture Photos of Land Documents </h2>
          <p className="pv-intro-desc">
            Take photos of your Documents with GPS location for carbon credit
            verification.Photos are uploaded in real-time.
          </p>
        </section>

        {/* Project Selector */}
        {projects.length > 0 && (
          <section className="pv-project-selector">
            <label className="pv-selector-label">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem", color: "var(--primary)" }}
              >
                eco
              </span>
              Link to Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="pv-selector-input"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Upload Area — opens camera */}
        <section className="pv-upload-section">
          <div className="pv-upload-box" onClick={openCamera}>
            <div className="pv-upload-icon">
              <span
                className="material-symbols-outlined"
                style={{ color: "var(--primary)", fontSize: "1.5rem" }}
              >
                photo_camera
              </span>
            </div>
            <div>
              <p className="pv-upload-label">Tap to Open Camera</p>
              <p className="pv-upload-hint">Capture photo with GPS location</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </section>

        {/* Recently Uploaded */}
        <section className="pv-recent-section">
          <div className="pv-recent-header">
            <h3 className="pv-recent-title">Uploaded Photos</h3>
            <span className="pv-view-all">{photos.length} total</span>
          </div>

          {loading ? (
            <div className="pv-loading">
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: "2rem", color: "var(--primary)" }}
              >
                progress_activity
              </span>
            </div>
          ) : photos.length === 0 ? (
            <div className="pv-empty">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "3rem", color: "var(--slate-300)" }}
              >
                photo_camera
              </span>
              <p>
                No photos uploaded yet. Tap above to capture your first photo.
              </p>
            </div>
          ) : (
            <div className="pv-photos-list">
              {photos.map((photo) => (
                <div key={photo.id} className="pv-photo-card animate-fade-in">
                  <div className="pv-photo-image-wrap">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="pv-photo-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="pv-photo-placeholder">
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "2rem",
                            color: "var(--slate-300)",
                          }}
                        >
                          image
                        </span>
                      </div>
                    )}
                    <div
                      className={`pv-status-pill ${getStatusClass(photo.status)}`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "0.875rem", fontWeight: 700 }}
                      >
                        {photo.status === "verified"
                          ? "check_circle"
                          : photo.status === "rejected"
                            ? "cancel"
                            : "schedule"}
                      </span>
                      <span className="pv-status-text">
                        {photo.status === "verified"
                          ? "Verified"
                          : photo.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="pv-photo-info">
                    <div className="pv-photo-info-header">
                      <div style={{ minWidth: 0 }}>
                        <h4 className="pv-photo-title">{photo.title}</h4>
                        <p className="pv-photo-meta">
                          {photo.capture_date || "N/A"} •{" "}
                          {photo.file_size || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="pv-tags">
                      <div className="pv-tag">
                        <span className="material-symbols-outlined pv-tag-icon">
                          calendar_month
                        </span>
                        <span>{photo.capture_time || "N/A"}</span>
                      </div>
                      {photo.gps_fix && (
                        <div className="pv-tag">
                          <span className="material-symbols-outlined pv-tag-icon">
                            satellite_alt
                          </span>
                          <span>GPS Fix</span>
                        </div>
                      )}
                    </div>

                    {photo.coordinates && (
                      <div className="pv-coords-row">
                        <div className="pv-coords-map">
                          <div className="pv-coords-map-bg"></div>
                          <span className="material-symbols-outlined pv-coords-pin">
                            location_on
                          </span>
                        </div>
                        <div className="pv-coords-info">
                          <p className="pv-coords-label">Coordinates</p>
                          <p className="pv-coords-value">{photo.coordinates}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trust Info */}
        <section className="pv-trust-section">
          <div className="pv-trust-card">
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--primary)", fontSize: "1.25rem" }}
            >
              lightbulb
            </span>
            <div>
              <h4 className="pv-trust-title">Trust Verification</h4>
              <p className="pv-trust-desc">
                GPS metadata provides indisputable proof of location, ensuring
                your carbon credits achieve maximum market value.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Camera Modal ===== */}
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
                ) : location ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1rem", color: "var(--primary)" }}
                    >
                      location_on
                    </span>
                    <span>
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
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
                  onClick={uploadPhoto}
                  disabled={uploading}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    {uploading ? "progress_activity" : "cloud_upload"}
                  </span>
                  {uploading ? "Uploading..." : "Upload & Verify"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
