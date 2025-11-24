import React from 'react';
import { About } from '../components/About';

const AboutPage: React.FC = () => {
  return (
    <div className="pt-20"> {/* pt-20 para compensar o Navbar fixo */}
      <About />
    </div>
  );
};

export default AboutPage;