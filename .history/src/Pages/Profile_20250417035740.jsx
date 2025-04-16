// profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    about: '',
    socialLinks: {
      linkedIn: '',
      github: ''
    },
    profilePic: ''
  });
  const history = useHistory();

  useEffect(() => {
    // Fetch the profile details
    axios.get('/api/profile/profile')
      .then(res => {
        setProfile(res.data);
        setFormData({
          ...formData,
          name: res.data.name,
          email: res.data.email,
          about: res.data.about,
          socialLinks: res.data.socialLinks
        });
      })
      .catch(err => {
        console.log('Error fetching profile:', err);
        history.push('/login');  // Redirect to login if profile is not found or user is unauthorized
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks')) {
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [name.split('.')[1]]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put('/api/profile/profile', formData)
      .then(res => {
        setProfile(res.data);
        alert('Profile updated successfully!');
      })
      .catch(err => {
        console.log('Error updating profile:', err);
      });
  };

  return (
    <div>
      {profile ? (
        <div>
          <h2>Profile</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label>About</label>
              <textarea name="about" value={formData.about} onChange={handleChange}></textarea>
            </div>
            <div>
              <label>LinkedIn</label>
              <input type="text" name="socialLinks.linkedIn" value={formData.socialLinks.linkedIn} onChange={handleChange} />
            </div>
            <div>
              <label>GitHub</label>
              <input type="text" name="socialLinks.github" value={formData.socialLinks.github} onChange={handleChange} />
            </div>
            <button type="submit">Update Profile</button>
          </form>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Profile;
