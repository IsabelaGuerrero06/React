import { useParams } from "react-router-dom";
import UserSessions from "./UserSessions";

const UserSessionsWrapper = () => {
  const { id } = useParams();
  const userId = Number(id || 0); // convierte string a number
  return <UserSessions userId={userId} />;
};

export default UserSessionsWrapper;
