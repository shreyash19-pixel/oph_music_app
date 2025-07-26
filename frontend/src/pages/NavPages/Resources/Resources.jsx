import React, { useEffect, useState } from "react";
import ReelsSlider from "./components/ReelsSlider/ReelsSlider";
import HeroSection from "./components/HeroSection/HeroSection";
import PodcastSlider from "../Home/components/PodcastSlider/PodcastSlider";
import Slider from "react-slick";
import { Image, Shimmer } from "react-shimmer";
import axiosApi from "../../../conf/axios";
import { Link } from "react-router-dom";
import SuccessSlider from "./components/SuccessStorySlider/SuccessSlider";
import { Helmet } from "react-helmet";
function Resources() {
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [reelsData, setReelsData] = useState([]);
  // const [reelsDataSuccess, setReelsDataSuccess] = useState([]);

 const [searchText, setSearchText] = useState('');
    console.log(searchText);
    
  return (
    <div>
      <Helmet>
        <title>Artist Learning Music Education Platform - OPH Community</title>
        <meta name="description" content="Access free music education podcasts videos and reels in online community platform. Learn from success stories and grow with best music community in india." />
      </Helmet>



      <HeroSection onSearch={setSearchText} />

      <PodcastSlider searchText={searchText}/>
      <ReelsSlider searchText={searchText}/>
      <SuccessSlider searchText={searchText} />

    </div>
  );
}

export default Resources;
