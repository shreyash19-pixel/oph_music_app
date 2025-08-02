import { Search, Bell, AlignJustify, Menu } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchContent } from "./content";
import { IoBookOutline } from "react-icons/io5";
import RootNav from '../../layouts/Navbar'


export default function Navbar({ onMenuClick }) {
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const countNoti = useSelector((state) => state.notification.countNewNotifications);
  const currentPage = useLocation().pathname;

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const results = await searchContent(query);
        setSearchResults(results.data);
        setShowDropdown(true);
      }
      catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
        setShowDropdown(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  return (
    <RootNav />
  );
}