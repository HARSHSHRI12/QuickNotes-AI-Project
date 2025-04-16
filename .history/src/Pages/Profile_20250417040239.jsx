import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    goals: ""
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Function to get the token from storage
  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  // Fetch profile data
  useEffect(() => {
    const controller = new AbortController(); // For canceling request if needed

    const fetchProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          setError("You are not logged in. Please login first.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:3500/api/profile/me",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in the Authorization header
            },
            signal: controller.signal,
          }
        );

        const data = response.data;
        setProfile(data);
        setFormData({
          bio: data.bio || "",
          skills: data.skills?.join(", ") || "",
          goals: data.goals || "",
        });
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request cancelled");
        } else if (err.response?.status === 401) {
          setError("Unauthorized. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login"; // Redirect to login if unauthorized
          }, 2000);
        } else {
          console.error("Profile fetch error:", err.message);
          setError("Failed to fetch profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Cleanup to cancel request on unmount
    return () => controller.abort();
  }, []);

  // Update profile data
  const handleUpdate = async () => {
    try {
      const token = getToken();

      if (!token) {
        setError("You need to log in first to update the profile.");
        return;
      }

      const updatedData = {
        bio: formData.bio.trim(),
        skills: formData.skills.split(",").map(skill => skill.trim()),
        goals: formData.goals.trim()
      };

      const res = await axios.put("http://localhost:3500/api/profile", updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data);
      setEditMode(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Update error:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      bio: profile?.bio || "",
      skills: profile?.skills?.join(", ") || "",
      goals: profile?.goals || ""
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>{profile?.name ? `${profile.name}'s Profile` : "User Profile"}</h2>
      <img
        src={profile?.avatar || "https://i.ibb.co/MBtjqXQ/no-avatar.png"}
        alt="Avatar"
        className="profile-avatar"
      />
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {!editMode ? (
        <div className="profile-info">
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>Bio:</strong> {profile?.bio}</p>
          <p><strong>Skills:</strong> {profile?.skills?.join(", ")}</p>
          <p><strong>Goals:</strong> {profile?.goals}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      ) : (
        <div className="profile-edit-form">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
          <label>Skills</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Comma separated skills"
          />
          <label>Goals</label>
          <textarea
            name="goals"
            value={formData.goals}
            onChange={handleChange}
          />
          <button onClick={handleUpdate}>Save Changes</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
