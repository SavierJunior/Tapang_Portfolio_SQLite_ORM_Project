import About from "../components/About";
import Achievements from "../components/Achievements";
import Contact from "../components/Contact";
import Education from "../components/Education";
import Hero from "../components/Hero";
import Projects from "../components/Projects";
import Resume from "../components/Resume";
import Skills from "../components/Skills";

export default function Home({ onNavigate }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <About onNavigate={onNavigate} />
      <Skills />
      <Projects />
      <Education />
      <Resume />
      <Achievements />
      <Contact />
    </>
  );
}
