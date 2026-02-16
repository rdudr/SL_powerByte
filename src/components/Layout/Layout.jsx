import React from 'react';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <main className='flex-1 p-4 overflow-y-auto md:p-6'>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
