import './nav.css';
import logo from '../../assets/logo.png'

export default function Nav() {
  return (
    <nav className="nav-container">
      <div className="nav-logo">
        <img src={logo}></img>
      </div>
    </nav>
  );
}
