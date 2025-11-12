import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ padding: '20px', backgroundColor: '#333', color: 'white', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Muni Moldes. Desde 2018.</p>
    </footer>
  );
};

export default Footer;