import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home/home';
import Login from '../pages/login/login';
import Register from '../pages/register/register';

export const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
];

const router = createBrowserRouter(routes);
export default router;
