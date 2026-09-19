function ActivityNav({ current }) {
  return (
    <nav className="activity-nav" aria-label="Nature activities">
      <a className={current === 'food-web' ? 'is-current' : ''} href="/">
        Food web
      </a>
      <a className={current === 'bird-sounds' ? 'is-current' : ''} href="/bird-sounds">
        Bird sounds
      </a>
    </nav>
  )
}

export default ActivityNav
