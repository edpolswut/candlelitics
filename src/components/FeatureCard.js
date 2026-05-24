import './FeatureCard.css';

function FeatureCard({ header, desc, icon }) {

    return (
        <div className="feature-card">
            <i className={`fas ${icon} feature-icon`}></i>
            <h3>{header}</h3>
            <p>{desc}</p>
        </div>
    );
}

export default FeatureCard;