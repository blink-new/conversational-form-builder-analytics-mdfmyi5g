import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <h1 className="font-heading text-7xl font-bold text-midnight mb-6">404</h1>
      <h2 className="font-heading text-2xl font-medium text-slate mb-4">Page Not Found</h2>
      <p className="max-w-md text-slate mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button className="bg-teal hover:bg-teal/90 text-white">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;