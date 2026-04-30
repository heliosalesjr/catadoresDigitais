import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Courses } from './components/Courses';
import { ComingSoon } from './components/ComingSoon';
import { Sponsors } from './components/Sponsors';
import { Footer } from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <Courses />
          <ComingSoon />
          <Sponsors />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
