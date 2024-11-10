import icon from "../assets/icon.png";
import { Link } from "react-router-dom";
import "./styling/admin_nav.css";

const AdminNavbar = () => {
   return (
      <div className="admin-navbar">
         <div className="admin-navbar-left">
            <div className="admin-navbar-logo">
               <img src={icon} alt="Logo" />
            </div>
            <h3>Stonks Market Admin Dashboard</h3>
         </div>

         <div className="admin-navbar-center">
         </div>

         
         <div className="admin-navbar-option">
            <Link to="/DB-Table Manip">Insert/Delete Tables</Link>
         </div>
         <div className="admin-navbar-option">
            <Link to="/querie">Send Queries</Link>
         </div>
         <div className="admin-navbar-option">
            <Link to="/table-lookup">View Tables</Link>
         </div>
         
      </div>
   );
};

export default AdminNavbar;