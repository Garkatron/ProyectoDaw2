import Navbar from '../components/Navbar';

// Este componente base proporciona el fondo general y asegura la altura completa.
const Base = ({ children }) => {
    return (
        // Usamos min-h-screen para que ocupe al menos la altura del viewport
        <div className="min-h-screen bg-gray-50">
          <Navbar />
            {children}
        </div>
    );
};

export default Base;