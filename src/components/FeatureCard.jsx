import './FeatureCard.css'

function FeatureCard({ title, description, onClick }) {
  return (
    <div className="feature-card" onClick={onClick}>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-description">{description}</p>
      <div className="feature-card-glow"></div>
    </div>
  )
}

function FeatureCards({ cards, onCardClick }) {
  return (
    <div className="feature-cards-container">
      {cards.map((card, index) => (
        <FeatureCard
          key={index}
          title={card.title}
          description={card.description}
          onClick={() => onCardClick && onCardClick(card)}
        />
      ))}
    </div>
  )
}

export { FeatureCard, FeatureCards }
export default FeatureCard
