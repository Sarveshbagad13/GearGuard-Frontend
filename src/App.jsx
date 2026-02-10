import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Modules from './components/Modules';
import Intelligence from './components/Intelligence';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

function App() {

  return (
    <>
      <div className="min-h-screen bg-primary-dark text-gray-100 font-sans overflow-x-hidden">
        <AnimatedBackground />
        <Navbar />
        <Hero />
        <Modules />
        <Intelligence />
        <CTA />
        <Footer />
      </div>
    </>
  )
}

export default App
