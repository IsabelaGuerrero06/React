import { lazy } from 'react';
import PasswordCreate from '../pages/Users/PasswordCreate';
import ListUsers from '../pages/Users/ListUser';
import ViewUser from '../pages/Users/ViewUser';
import CreateUser from '../pages/Users/CreateUser';
import UpdateUser from '../pages/Users/UpdateUser';
import UsersRoles from '../pages/Users/Roles';
import UserAddress from '../pages/Users/UserAddress';
import Permissions from '../pages/Permissions/Permissions';
import ListSecurityQuestions from '../pages/SecurityQuestions/ListSecurityQuestion';
import CreateSecurityQuestions from '../pages/SecurityQuestions/CreateSecurityQuestion';
import UpdateSecurityQuestions from '../pages/SecurityQuestions/UpdateSecurityQuestion';
import ViewSecurityQuestion from '../pages/SecurityQuestions/ViewSecurityQuestion';
import ListAnswer from '../pages/Answers/ListAnswer';
import ListAnswersByUser from '../pages/Answers/ListAnswerByUser';
import ListAnswersByQuestion from '../pages/Answers/ListAnswerByQuestion';
import CreateAnswer from '../pages/Answers/CreateAnswer';
import UpdateAnswer from '../pages/Answers/UpdateAnswer';
import UserSessionsWrapper from '../pages/UserSessionWrapper';
import ViewAnswer from '../pages/Answers/ViewAnswer';
import ListDevice from '../pages/Devices/ListDevice';
import ListDevicesByUser from '../pages/Devices/ListDeviceByUser';
import UpdateDevice from '../pages/Devices/UpdateDevice';
import CreateDevice from '../pages/Devices/CreateDevice';
import ViewDevice from '../pages/Devices/ViewDevice';
import CreatePermission from '../pages/Permissions/CreatePermission';
import UpdatePermission from '../pages/Permissions/UpdatePermission';

// Componentes de perfil
const Profile = lazy(() => import('../pages/Profiles/Profile'));
const ProfileDefault = lazy(() => import('../pages/Profiles/ProfileDefault'));
const CreateProfile = lazy(() => import('../pages/Profiles/CreateProfile'));
const UpdateProfile = lazy(() => import('../pages/Profiles/UpdateProfile'));
const DeleteProfile = lazy(() => import('../pages/Profiles/DeleteProfile'));

// Otros componentes lazy
const Calendar = lazy(() => import('../pages/Calendar'));
const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const Demo = lazy(() => import('../pages/Demo'));
const MicrosoftCallback = lazy(
  () => import('../pages/Authentication/MicrosoftCallback'),
);
const OAuthPopupReceiver = lazy(
  () => import('../pages/Authentication/OAuthPopupReceiver'),
);
const RoleUsers = lazy(() => import('../pages/Users/RoleUsers'));

const authRoutes = [
  {
    path: '/auth/microsoft/callback',
    title: 'Microsoft Auth Callback',
    component: MicrosoftCallback,
  },
  {
    path: '/auth/popup-receiver',
    title: 'OAuth Popup Receiver',
    component: OAuthPopupReceiver,
  },
];

const coreRoutes = [
  // Devices
  {
    path: '/devices/create',
    title: 'Create Device',
    component: CreateDevice,
  },
  {
    path: '/devices/update/:id',
    title: 'Update Device',
    component: UpdateDevice,
  },
  {
    path: '/devices/list',
    title: 'List Devices',
    component: ListDevice,
  },
  {
    path: '/devices/user/:userId',
    title: 'List Devices By User',
    component: ListDevicesByUser,
  },
  {
    path: '/devices/:id',
    title: 'List An Specific Device',
    component: ViewDevice,
  },
  // Security Questions
  {
    path: '/security-questions/create',
    title: 'Create Security Questions',
    component: CreateSecurityQuestions,
  },
  {
    path: '/security-questions/update/:id',
    title: 'Update Security Questions',
    component: UpdateSecurityQuestions,
  },
  {
    path: '/security-questions/list',
    title: 'List Security Questions',
    component: ListSecurityQuestions,
  },
  {
    path: '/security-questions/:id',
    title: 'List An Specific Security Question',
    component: ViewSecurityQuestion,
  },
  // Answers
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
    path: '/answers/user/:userId',
    title: 'List Answers By User',
    component: ListAnswersByUser,
  },
  {
    path: '/answers/question/:questionId',
    title: 'List Answers By Question',
    component: ListAnswersByQuestion,
  },
  {
    path: '/answers/:id',
    title: 'List An Specific Answer',
    component: ViewAnswer,
  },
  // Users
  {
    path: '/users/roles',
    title: 'Users Roles',
    component: UsersRoles,
  },
  {
    path: '/user-role/:id',
    title: 'Users by Role',
    component: RoleUsers,
  },
  {
    path: '/users/list',
    title: 'List Users',
    component: ListUsers,
  },
  {
    path: '/users/:id',
    title: 'List An Specific User',
    component: ViewUser,
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
    path: '/address/:userId',
    title: 'User Address',
    component: UserAddress,
  },
  // Permissions
  {
    path: '/users/permissions',
    title: 'Permissions',
    component: Permissions,
  },
  {
    path: '/permissions/create',
    title: 'Create Permission',
    component: CreatePermission,
  },
  {
    path: '/permissions/update/:id',
    title: 'Update Permission',
    component: UpdatePermission,
  },
  // Sessions
  {
    path: '/sessions/:id',
    title: 'User Sessions',
    component: UserSessionsWrapper,
  },
  {
    path: '/passwords/:userId',
    title: 'User Passwords',
    component: PasswordCreate,
  },
  // Profiles
  {
    path: '/profile',
    title: 'Profile Default',
    component: ProfileDefault,
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
    path: '/profile/update/:id',
    title: 'Update Profile',
    component: UpdateProfile,
  },
  {
    path: '/profiles/delete/:id',
    title: 'Delete Profile',
    component: DeleteProfile,
  },
  // Otros
  {
    path: '/demo',
    title: 'Demo',
    component: Demo,
  },
  {
    path: '/calendar',
    title: 'Calendar',
    component: Calendar,
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

export default [...authRoutes, ...coreRoutes];