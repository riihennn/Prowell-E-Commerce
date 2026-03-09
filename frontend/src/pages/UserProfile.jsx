import React, { useContext, useEffect, useState } from 'react';
import { User, Camera, Mail, Phone, MapPin, LogOut, Package } from 'lucide-react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    avatar: null,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+91-*--*****',
        location: user.location || 'India',
        joinDate: user.joinDate || 'January 2023',
        bio: user.bio || 'Add Bio',
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className=" bg-gray-50 flex justify-center px-4 sm:px-6 lg:px-12 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Profile Header */}
        <div className="bg-[#ffbe00] p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-8">
            
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white object-cover"
                    src={profile.avatar}
                    alt={profile.name}
                  />
                ) : (
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-[#ffbe00] flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {profile.name}
                </h1>
                <p className="text-blue-100 text-lg mt-1">
                  Member since {profile.joinDate}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center space-x-2 bg-white text-black font-semibold px-4 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-[#dddcdc] transition-colors text-sm sm:text-lg"
              >
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Your Orders</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-[#dbdbdb] text-black px-4 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-[#dddddd] transition-colors text-sm sm:text-lg"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 sm:p-10 space-y-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Contact Information
            </h2>

            <div className="flex items-center space-x-4 text-lg">
              <Mail className="h-6 w-6 text-gray-400" />
              <span className="text-gray-700">{profile.email}</span>
            </div>

            <div className="flex items-center space-x-4 text-lg">
              <Phone className="h-6 w-6 text-gray-400" />
              <span className="text-gray-700">{profile.phone}</span>
            </div>

            <div className="flex items-center space-x-4 text-lg">
              <MapPin className="h-6 w-6 text-gray-400" />
              <span className="text-gray-700">{profile.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
