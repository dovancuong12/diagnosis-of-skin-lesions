import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

