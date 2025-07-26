import React from "react";
import HeroSection from "./components/HeroSection/HeroSection";
import IndustryStats from "./components/IndustryStatsSection/IndustryStatsSection";
import PodcastSlider from "./components/PodcastSlider/PodcastSlider";
import BookSpot from "./components/BookSpotSection/BookSpotSection";
import WhatWeProvide from "./components/WhatWeProvideSection/WhatWeProvideSection";
import MusicTasteSection from "./components/MusicTasteSection/MusicTasteSection";
import TopPicksSection from "./components/TopPicksSection/TopPicksSection";
import StruggleEndsSection from "./components/StruggleEndSection/StruggleEndSection";
import ArtistSlider from "./components/ArtistSlider/ArtistSlider";
import TipsSlider from "./components/TipsSlider/TipsSlider";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchWebsiteConfig } from "../../../slice/website_config";
import {Helmet} from "react-helmet";

function Home() {

  return (
    <div className="relative ">
      <Helmet>
        <title>Independent Artist Platform in India for Music - OPH Community</title>
        <meta name="description" content="Join OPH Community - an open-source, artist management platform offers 100% ownership, a powerful music collaboration platform and free music distribution." />
      </Helmet>
      <HeroSection />
       <div className="lg:px-10 px-6 xl:px-16">
      <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

       </div>
      <IndustryStats />
      <div className=" lg:px-10 px-6 xl:px-16">
      <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

       </div>
      <PodcastSlider />
      <div className=" lg:px-10 px-6 xl:px-16">
      <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

       </div>
      <ArtistSlider />
      <div className=" lg:px-10 px-6 xl:px-16">
      <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

       </div>
      <TipsSlider />
      <BookSpot />
      <WhatWeProvide />
      <div className=" lg:px-10 px-6 xl:px-16">
      <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

       </div>
      <TopPicksSection />
      <div className=" lg:px-10 px-6 xl:px-16">
      <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

       </div>
      <StruggleEndsSection />
      <MusicTasteSection />
    </div>
  );
}

export default Home;
