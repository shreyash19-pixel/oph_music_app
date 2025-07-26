import HeroSection from "./components/HeroSection";
import { Helmet } from "react-helmet";

function Contact() {
  return (
    <div className="relative">
      <Helmet>
        <title>Join Music Creator Community | Contact OPH
        </title>
        <meta name="description" content="Want to be part of OPH Community? Fill out the contact form and take the first step to artist management and join the most inspiring independent artist platform.
" />
      </Helmet>
      <HeroSection />
    </div>
  );
}

export default Contact;
