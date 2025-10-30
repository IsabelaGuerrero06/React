import { List, User } from 'lucide-react';
import { lazy } from 'react';
import ListUsers from '../pages/Users/ListUser';
import UsersRoles from '../pages/Users/Roles';
import CreateUser from '../pages/Users/CreateUser';
import UpdateUser from '../pages/Users/UpdateUser';
import Permissions from '../pages/Permissions'; 
import ListAnswer from '../pages/Answers/ListAnswer';
import CreateAnswer from '../pages/Answers/CreateAnswer';
import UpdateAnswer from '../pages/Answers/UpdateAnswer';
import UserSessionsWrapper from "../pages/UserSessionWrapper";


const Profile = lazy(() => import('../pages/Profiles/Profile'));
const CreateProfile = lazy(() => import('../pages/Profiles/CreateProfile'));
const UpdateProfile = lazy(() => import('../pages/Profiles/UpdateProfile'));
const DeleteProfile = lazy(() => import('../pages/Profiles/DeleteProfile'));

const Calendar = lazy(() => import('../pages/Calendar'));
const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const Demo = lazy(() => import('../pages/Demo'));

const coreRoutes = [
  {
    path: '/answers/create',
    title: 'Create Answers',
    component: CreateAnswer,
  },
  {
    path: '/answers/update/:id',
    title: 'Update Answers',
    component: UpdateAnswer,
  },
  {
    path: '/answers/list',
    title: 'List Answers',
    component: ListAnswer,
  },
  {
    path: '/users/roles',
    title: 'Users Roles',
    component: UsersRoles,
  },
  {
    path: '/users/list',
    title: 'List Users',
    component: ListUsers,
  },
  {
    path: '/users/create',
    title: 'Create Users',
    component: CreateUser,
  },
  {
    path: '/users/update/:id',
    title: 'Update Users',
    component: UpdateUser,
  },
  {
    path: '/users/permissions',         
    title: 'Permissions',              
    component: Permissions,            
  }, 
  {
  path: "/sessions/user/:id",  // :id es dinámico
  title: "User Sessions",
  component: UserSessionsWrapper, // usamos el wrapper
},
  {
    path: '/demo',
    title: 'Demo',
    component: Demo,
  },
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/profile/:id',
    title: 'Profile Details',
    component: Profile,
  },
  {
    path: '/profiles/user/:id',
    title: 'User Profile',
    component: Profile,
  },
  {
    path: '/profiles/create/:id',
    title: 'Create Profile',
    component: CreateProfile,
  },
  {
    path: '/profiles/edit/:id',
    title: 'Edit Profile',
    component: UpdateProfile,
  },
  {
    path: '/profiles/delete/:id',
    title: 'Delete Profile',
    component: DeleteProfile,
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/chart',
    title: 'Chart',
    component: Chart,
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
];

const routes = [...coreRoutes];
export default routes;
