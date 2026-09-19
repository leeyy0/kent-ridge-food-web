import { useMemo, useRef, useState } from 'react'
import ActivityNav from './ActivityNav.jsx'

const birds = [
  {
    id: 'laughingthrush',
    name: 'White-crested Laughingthrush',
    scientificName: 'Garrulax leucolophus diardi',
    image: '/bird%20pics/white-crested-laughingthrush.jpg',
    sound: '/sounds/XC1158028%20-%20White-crested%20Laughingthrush%20-%20Garrulax%20leucolophus%20diardi.mp3',
  },
  {
    id: 'drongo',
    name: 'Greater Racket-tailed Drongo',
    scientificName: 'Dicrurus paradiseus brachyphorus',
    image: '/bird%20pics/greater-racket-tailed-drongo.jpg',
    sound: '/sounds/XC1166145%20-%20Greater%20Racket-tailed%20Drongo%20-%20Dicrurus%20paradiseus%20brachyphorus.wav',
  },
  {
    id: 'flameback',
    name: 'Common Flameback',
    scientificName: 'Dinopium javanense',
    image: '/bird%20pics/common-flameback.jpg',
    sound: '/sounds/XC1161211%20-%20Common%20Flameback%20-%20Dinopium%20javanense.mp3',
  },
  {
    id: 'kite',
    name: 'Brahminy Kite',
    scientificName: 'Haliastur indus',
    image: '/bird%20pics/brahminy-kite.jpg',
    sound: '/sounds/XC663577%20-%20Brahminy%20Kite%20-%20Haliastur%20indus.mp3',
  },
]

const callOrder = ['drongo', 'kite', 'laughingthrush', 'flameback']
const photoOrder = ['flameback', 'laughingthrush', 'kite', 'drongo']

function BirdSounds() {
  const [matched, setMatched] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [playingId, setPlayingId] = useState(null)
  const [hoveredBird, setHoveredBird] = useState(null)
  const [wrongBird, setWrongBird] = useState(null)
  const [touchDrag, setTouchDrag] = useState(null)
  const [status, setStatus] = useState({
    tone: 'neutral',
    message: 'Start by playing one of the bird calls.',
  })
  const audioRefs = useRef({})
  const touchDragRef = useRef(null)

  const byId = useMemo(
    () => Object.fromEntries(birds.map((bird) => [bird.id, bird])),
    [],
  )
  const complete = matched.length === birds.length

  function stopAudio(reset = false) {
    Object.values(audioRefs.current).forEach((audio) => {
      if (!audio) return
      audio.pause()
      if (reset) audio.currentTime = 0
    })
    setPlayingId(null)
  }

  function toggleAudio(id) {
    const audio = audioRefs.current[id]
    if (!audio) return

    if (playingId === id && !audio.paused) {
      audio.pause()
      setPlayingId(null)
      return
    }

    stopAudio()
    audio.play().then(() => setPlayingId(id)).catch(() => {
      setStatus({
        tone: 'error',
        message: 'The sound could not play. Please try again.',
      })
    })
  }

  function selectCall(id) {
    if (matched.includes(id)) return
    const nextId = selectedId === id ? null : id
    setSelectedId(nextId)
    setStatus({
      tone: 'neutral',
      message: nextId
        ? `Bird call ${callOrder.indexOf(id) + 1} selected. Now choose the bird you heard.`
        : 'Selection cleared. Play or select another bird call.',
    })
  }

  function attemptMatch(callId, birdId) {
    if (!callId || matched.includes(callId)) return

    if (callId === birdId) {
      const nextMatched = [...matched, callId]
      setMatched(nextMatched)
      setSelectedId(null)
      setHoveredBird(null)
      setStatus({
        tone: nextMatched.length === birds.length ? 'complete' : 'success',
        message:
          nextMatched.length === birds.length
            ? 'Wonderful listening! You matched all four bird calls.'
            : `That’s right — you heard the ${byId[callId].name}.`,
      })
      return
    }

    setWrongBird(birdId)
    setStatus({
      tone: 'error',
      message: `That call belongs to a different bird. Listen again and retry.`,
    })
    window.setTimeout(() => setWrongBird(null), 520)
  }

  function birdAtPoint(clientX, clientY) {
    return document.elementFromPoint(clientX, clientY)?.closest('[data-bird-target]')?.dataset.birdTarget ?? null
  }

  function startTouchDrag(event, id) {
    if ((event.pointerType !== 'touch' && event.pointerType !== 'pen') || matched.includes(id)) return
    const interaction = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY,
      active: false,
    }
    touchDragRef.current = interaction
    setTouchDrag(interaction)
    setSelectedId(id)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function moveTouchDrag(event) {
    const interaction = touchDragRef.current
    if (!interaction || interaction.pointerId !== event.pointerId) return
    const distance = Math.hypot(event.clientX - interaction.startX, event.clientY - interaction.startY)
    const nextInteraction = {
      ...interaction,
      clientX: event.clientX,
      clientY: event.clientY,
      active: interaction.active || distance > 6,
    }
    touchDragRef.current = nextInteraction
    setTouchDrag(nextInteraction)
    if (nextInteraction.active) {
      event.preventDefault()
      setHoveredBird(birdAtPoint(event.clientX, event.clientY))
    }
  }

  function finishTouchDrag(event, cancelled = false) {
    const interaction = touchDragRef.current
    if (!interaction || interaction.pointerId !== event.pointerId) return

    if (interaction.active && !cancelled) {
      const birdId = birdAtPoint(event.clientX, event.clientY)
      if (birdId) attemptMatch(interaction.id, birdId)
    }

    touchDragRef.current = null
    setTouchDrag(null)
    setHoveredBird(null)
  }

  function resetGame() {
    stopAudio(true)
    touchDragRef.current = null
    setMatched([])
    setSelectedId(null)
    setHoveredBird(null)
    setWrongBird(null)
    setTouchDrag(null)
    setStatus({ tone: 'neutral', message: 'Start by playing one of the bird calls.' })
  }

  return (
    <main className="bird-sounds-page">
      <header className="bird-hero">
        <div className="bird-hero__topline">
          <div className="hero__eyebrow"><span aria-hidden="true">●</span> Kent Ridge Park</div>
          <ActivityNav current="bird-sounds" />
        </div>

        <div className="bird-hero__content">
          <div>
            <p className="hero__kicker">Listen closely</p>
            <h1>Whose call is it?</h1>
            <p className="bird-hero__intro">
              Play each recording, then drag the sound card to the bird you think made it.
            </p>
          </div>
          <div className="bird-progress" aria-label={`${matched.length} of ${birds.length} bird calls matched`}>
            <span className="bird-progress__icon" aria-hidden="true">♪</span>
            <div>
              <span className="progress-card__number">{matched.length}<small> / {birds.length}</small></span>
              <span className="progress-card__label">calls matched</span>
            </div>
          </div>
        </div>

        <div className="bird-hero__portraits" aria-hidden="true">
          {photoOrder.map((id) => <img key={id} src={byId[id].image} alt="" />)}
        </div>
      </header>

      <section className="bird-game" aria-labelledby="bird-game-title">
        <div className="bird-game__heading">
          <div>
            <span className="step-pill">Sound matching challenge</span>
            <h2 id="bird-game-title">Match every call to its bird</h2>
            <p>Use headphones if you can. You can replay each recording as many times as you need.</p>
          </div>
          <button className="reset-button" type="button" onClick={resetGame}>
            <span aria-hidden="true">↻</span> Start again
          </button>
        </div>

        <div className={`bird-status status-bar--${status.tone}`} role="status" aria-live="polite">
          <span className="status-bar__icon" aria-hidden="true">
            {status.tone === 'success' || status.tone === 'complete' ? '✓' : status.tone === 'error' ? '!' : 'i'}
          </span>
          <span>{status.message}</span>
        </div>

        <div className="bird-game__layout">
          <section className="sound-bank" aria-labelledby="sound-bank-title">
            <div className="bird-section-label">
              <span>01</span>
              <div><h3 id="sound-bank-title">Play a bird call</h3><p>Then drag or select the card.</p></div>
            </div>

            <div className="sound-list">
              {callOrder.map((id, index) => {
                const isMatched = matched.includes(id)
                const isSelected = selectedId === id
                const isPlaying = playingId === id
                return (
                  <div
                    key={id}
                    className={`sound-card${isSelected ? ' is-selected' : ''}${isMatched ? ' is-matched' : ''}${touchDrag?.active && touchDrag.id === id ? ' is-touch-dragging' : ''}`}
                    draggable={!isMatched}
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', id)
                      event.dataTransfer.effectAllowed = 'move'
                      setSelectedId(id)
                    }}
                    onDragEnd={() => setHoveredBird(null)}
                  >
                    <audio
                      ref={(element) => { audioRefs.current[id] = element }}
                      src={byId[id].sound}
                      preload="metadata"
                      onEnded={() => setPlayingId(null)}
                    />
                    <button
                      className={`sound-card__play${isPlaying ? ' is-playing' : ''}`}
                      type="button"
                      onClick={() => toggleAudio(id)}
                      aria-label={`${isPlaying ? 'Pause' : 'Play'} bird call ${index + 1}`}
                    >
                      <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
                    </button>
                    <button
                      className="sound-card__select"
                      type="button"
                      onClick={() => selectCall(id)}
                      disabled={isMatched}
                      aria-pressed={isSelected}
                    >
                      <span className="sound-card__eyebrow">Recording {String(index + 1).padStart(2, '0')}</span>
                      <strong>{isMatched ? byId[id].name : `Bird call ${index + 1}`}</strong>
                      <span className="sound-card__instruction">
                        {isMatched ? 'Matched correctly' : isSelected ? 'Selected — choose a photo' : 'Play, then select'}
                      </span>
                    </button>
                    <span
                      className="sound-card__handle"
                      aria-hidden="true"
                      onPointerDown={(event) => startTouchDrag(event, id)}
                      onPointerMove={moveTouchDrag}
                      onPointerUp={finishTouchDrag}
                      onPointerCancel={(event) => finishTouchDrag(event, true)}
                    >
                      {isMatched ? '✓' : '⋮⋮'}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <div className="bird-game__divider" aria-hidden="true"><span>→</span></div>

          <section className="bird-gallery" aria-labelledby="bird-gallery-title">
            <div className="bird-section-label">
              <span>02</span>
              <div><h3 id="bird-gallery-title">Choose the bird</h3><p>Drop the sound on its matching photo.</p></div>
            </div>

            <div className="bird-grid">
              {photoOrder.map((id) => {
                const bird = byId[id]
                const isMatched = matched.includes(id)
                const isHovered = hoveredBird === id
                const isWrong = wrongBird === id
                return (
                  <button
                    key={id}
                    type="button"
                    className={`bird-target${isMatched ? ' is-matched' : ''}${isHovered ? ' is-hovered' : ''}${isWrong ? ' is-wrong' : ''}`}
                    data-bird-target={isMatched ? undefined : id}
                    disabled={isMatched}
                    onClick={() => attemptMatch(selectedId, id)}
                    onDragEnter={(event) => {
                      event.preventDefault()
                      if (!isMatched) setHoveredBird(id)
                    }}
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) setHoveredBird(null)
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      attemptMatch(event.dataTransfer.getData('text/plain'), id)
                    }}
                  >
                    <span className="bird-target__image">
                      <img src={bird.image} alt="" draggable="false" />
                      <span className="bird-target__drop-prompt">{isMatched ? 'Matched' : 'Drop call here'}</span>
                      {isMatched && <span className="bird-target__check" aria-hidden="true">✓</span>}
                    </span>
                    <span className="bird-target__copy">
                      <strong>{bird.name}</strong>
                      <em>{bird.scientificName}</em>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {complete && (
          <div className="bird-complete" role="status">
            <span aria-hidden="true">♪</span>
            <div><strong>You know the chorus!</strong><p>All four Kent Ridge bird calls are matched.</p></div>
            <button type="button" onClick={resetGame}>Play again</button>
          </div>
        )}
      </section>

      {touchDrag?.active && (
        <div className="sound-drag-preview" style={{ left: touchDrag.clientX, top: touchDrag.clientY }} aria-hidden="true">
          <span>♪</span> Bird call {callOrder.indexOf(touchDrag.id) + 1}
        </div>
      )}

      <footer>
        <p>Explore, observe, and protect the biodiversity of Kent Ridge Park.</p>
        <p>Listen responsibly and keep wild spaces peaceful.</p>
      </footer>
    </main>
  )
}

export default BirdSounds
