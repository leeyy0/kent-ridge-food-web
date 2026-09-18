import { useMemo, useState } from 'react'
import batImage from './assets/lesser-dog-faced-fruit-bat.png'
import beeImage from './assets/broad-handed-carpenter-bee.png'
import bulbulImage from './assets/olive-winged-bulbul.png'
import flamebackImage from './assets/common-flameback.png'
import kiteImage from './assets/brahminy-kite.png'
import simpohImage from './assets/simpoh-air.png'
import tembusuImage from './assets/tembusu.png'

const organisms = [
  {
    id: 'flameback',
    name: 'Common Flameback',
    image: flamebackImage,
    clue: 'This woodpecker feeds on insect larvae and may itself become prey.',
    slot: { left: 69.53, top: 47.96, width: 11.98, height: 21.3 },
    label: { left: 69.48, top: 69.35, width: 12.76, height: 3.61 },
  },
  {
    id: 'tembusu',
    name: 'Tembusu',
    image: tembusuImage,
    clue: 'The fruits of this native tree are eaten by birds and fruit bats.',
    slot: { left: 14.32, top: 26.48, width: 13.02, height: 23.15 },
    label: { left: 17.4, top: 50.93, width: 7, height: 3.61 },
  },
  {
    id: 'bat',
    name: 'Lesser Dog-faced Fruit Bat',
    image: batImage,
    clue: 'This nocturnal mammal eats fruit and nectar and can be preyed on by a raptor.',
    slot: { left: 35.42, top: 1.85, width: 12.76, height: 22.69 },
    label: { left: 33.49, top: 25.09, width: 16.46, height: 3.8 },
  },
  {
    id: 'bee',
    name: 'Broad-handed Carpenter Bee',
    image: beeImage,
    clue: 'This pollinator feeds on nectar and pollen; its larvae may be eaten by birds.',
    slot: { left: 42.29, top: 63.7, width: 13.02, height: 23.15 },
    label: { left: 39.48, top: 87.04, width: 18.44, height: 3.7 },
  },
  {
    id: 'kite',
    name: 'Brahminy Kite',
    image: kiteImage,
    clue: 'This raptor sits at the top of this food web and preys on several animals.',
    slot: { left: 68.49, top: 4.63, width: 16.77, height: 29.81 },
    label: { left: 72.24, top: 35.93, width: 9.74, height: 3.61 },
  },
  {
    id: 'simpoh',
    name: 'Simpoh Air',
    image: simpohImage,
    clue: 'Its flowers offer nectar and pollen, while its fruits are food for birds.',
    slot: { left: 14.38, top: 58.89, width: 12.76, height: 22.69 },
    label: { left: 16.88, top: 82.59, width: 8.44, height: 3.52 },
  },
  {
    id: 'bulbul',
    name: 'Olive-winged Bulbul',
    image: bulbulImage,
    clue: 'This bird eats fruit and may become prey for a larger bird of prey.',
    slot: { left: 43.13, top: 31.67, width: 12.76, height: 22.69 },
    label: { left: 43.13, top: 55.09, width: 12.95, height: 3.43 },
  },
]

const bankOrder = ['flameback', 'tembusu', 'bat', 'bee', 'kite', 'simpoh', 'bulbul']

function styleFromBox(box) {
  return {
    left: `${box.left}%`,
    top: `${box.top}%`,
    width: `${box.width}%`,
    height: `${box.height}%`,
  }
}

function App() {
  const [placed, setPlaced] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [wrongSlot, setWrongSlot] = useState(null)
  const [status, setStatus] = useState({
    tone: 'neutral',
    message: 'Select an organism to begin.',
  })
  const [hintVisible, setHintVisible] = useState(false)

  const byId = useMemo(
    () => Object.fromEntries(organisms.map((organism) => [organism.id, organism])),
    [],
  )
  const complete = placed.length === organisms.length

  function attemptPlacement(itemId, slotId) {
    if (!itemId || placed.includes(itemId)) return

    if (itemId === slotId) {
      const nextPlaced = [...placed, itemId]
      setPlaced(nextPlaced)
      setSelectedId(null)
      setHintVisible(false)
      setHoveredSlot(null)
      setStatus({
        tone: nextPlaced.length === organisms.length ? 'complete' : 'success',
        message:
          nextPlaced.length === organisms.length
            ? 'Food web complete! Every organism is in the right place.'
            : `Correct! ${byId[itemId].name} fits here.`,
      })
      return
    }

    setWrongSlot(slotId)
    setStatus({
      tone: 'error',
      message: `Not quite. Follow the yellow arrows and try ${byId[itemId].name} somewhere else.`,
    })
    window.setTimeout(() => setWrongSlot(null), 520)
  }

  function handleCardClick(id) {
    if (placed.includes(id)) return
    const nextId = selectedId === id ? null : id
    setSelectedId(nextId)
    setHintVisible(false)
    setStatus({
      tone: 'neutral',
      message: nextId
        ? `${byId[id].name} selected. Now tap its circle on the food web.`
        : 'Selection cleared. Choose another card when you are ready.',
    })
  }

  function handleDragStart(event, id) {
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
    setSelectedId(id)
  }

  function resetGame() {
    setPlaced([])
    setSelectedId(null)
    setDraggingId(null)
    setHoveredSlot(null)
    setWrongSlot(null)
    setHintVisible(false)
    setStatus({
      tone: 'neutral',
      message: 'Fresh start! Choose a card and rebuild the food web.',
    })
  }

  const selected = selectedId ? byId[selectedId] : null

  return (
    <main>
      <header className="hero">
        <div className="hero__eyebrow"><span aria-hidden="true">●</span> Kent Ridge Park</div>
        <div className="hero__heading">
          <div>
            <p className="hero__kicker">Interactive nature challenge</p>
            <h1>Build the food web</h1>
            <p className="hero__intro">
              Match seven local plants and animals to the clues in this forest food web.
            </p>
          </div>
          <div className="progress-card" aria-label={`${placed.length} of ${organisms.length} answers correct`}>
            <span className="progress-card__number">{placed.length}<small> / {organisms.length}</small></span>
            <span className="progress-card__label">correctly placed</span>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${(placed.length / organisms.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <section className="game-shell" aria-labelledby="answer-bank-title">
        <div className="play-layout">
          <aside className="organism-panel">
            <div className="section-heading">
              <div>
                <span className="step-pill">Step 1</span>
                <h2 id="answer-bank-title">Choose an organism</h2>
                <p>Select from the seven Kent Ridge species.</p>
              </div>
              <button className="reset-button" type="button" onClick={resetGame}>
                <span aria-hidden="true">↻</span> Reset
              </button>
            </div>

            <div className="answer-bank">
              {bankOrder.map((id) => {
                const organism = byId[id]
                const isPlaced = placed.includes(id)
                const isSelected = selectedId === id
                return (
                  <button
                    key={id}
                    type="button"
                    className={`organism-card${isSelected ? ' is-selected' : ''}${isPlaced ? ' is-placed' : ''}`}
                    draggable={!isPlaced}
                    disabled={isPlaced}
                    aria-pressed={isSelected}
                    onClick={() => handleCardClick(id)}
                    onDragStart={(event) => handleDragStart(event, id)}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setHoveredSlot(null)
                    }}
                  >
                    <span className="organism-card__photo">
                      <img src={organism.image} alt="" draggable="false" />
                    </span>
                    <span className="organism-card__name">{organism.name}</span>
                    <span className="organism-card__state" aria-hidden="true">{isPlaced ? '✓' : '⋮⋮'}</span>
                  </button>
                )
              })}
            </div>

          </aside>

          <section className="board-panel" aria-labelledby="board-title">
            <div className="board-heading">
              <div>
                <span className="step-pill">Step 2</span>
                <h2 id="board-title">Complete the food web</h2>
                <p>Choose a card, then drag it—or tap a circle—to place it.</p>
              </div>
            </div>

            <div className={`status-bar status-bar--${status.tone}`} role="status" aria-live="polite">
              <span className="status-bar__icon" aria-hidden="true">
                {status.tone === 'success' || status.tone === 'complete' ? '✓' : status.tone === 'error' ? '!' : 'i'}
              </span>
              <span>{status.message}</span>
              <button
                type="button"
                className="hint-button"
                onClick={() => setHintVisible((visible) => !visible)}
                disabled={!selected || placed.includes(selected.id)}
              >
                {hintVisible ? 'Hide hint' : 'Hint'}
              </button>
            </div>

            {hintVisible && selected && (
              <div className="hint-card">
                <span aria-hidden="true">💡</span>
                <p><strong>{selected.name}:</strong> {selected.clue}</p>
              </div>
            )}

            <div className="board-scroll" aria-label="Food web board">
              <div className={`food-web-board${complete ? ' is-complete' : ''}`}>
                <img
                  className="food-web-board__background"
                  src="/kent-ridge-food-web.png"
                  alt="Kent Ridge Park food web with arrows describing feeding and predator relationships"
                  draggable="false"
                />

                {organisms.map((organism) => {
                  const isFilled = placed.includes(organism.id)
                  const isHovered = hoveredSlot === organism.id
                  const isWrong = wrongSlot === organism.id
                  return (
                    <div key={organism.id}>
                      <button
                        type="button"
                        className={`drop-slot${isFilled ? ' is-filled' : ''}${isHovered ? ' is-hovered' : ''}${isWrong ? ' is-wrong' : ''}`}
                        style={styleFromBox(organism.slot)}
                        aria-label={isFilled ? `${organism.name}, correctly placed` : `Empty answer circle${selected ? ` for ${selected.name}` : ''}`}
                        disabled={isFilled}
                        onClick={() => attemptPlacement(selectedId, organism.id)}
                        onDragEnter={(event) => {
                          event.preventDefault()
                          if (!isFilled) setHoveredSlot(organism.id)
                        }}
                        onDragOver={(event) => {
                          event.preventDefault()
                          event.dataTransfer.dropEffect = 'move'
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget)) setHoveredSlot(null)
                        }}
                        onDrop={(event) => {
                          event.preventDefault()
                          const itemId = event.dataTransfer.getData('text/plain') || draggingId
                          attemptPlacement(itemId, organism.id)
                          setDraggingId(null)
                        }}
                      >
                        {isFilled ? (
                          <img src={organism.image} alt={organism.name} draggable="false" />
                        ) : (
                          <span className="drop-slot__prompt">
                            <span aria-hidden="true">＋</span>
                            <small>Drop here</small>
                          </span>
                        )}
                      </button>
                      {isFilled && (
                        <span className="placed-label" style={styleFromBox(organism.label)}>
                          {organism.name}
                        </span>
                      )}
                    </div>
                  )
                })}

                {complete && (
                  <div className="completion-badge" role="status">
                    <span aria-hidden="true">✓</span>
                    <strong>Food web complete!</strong>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>

      <footer>
        <p>Explore, observe, and protect the biodiversity of Kent Ridge Park.</p>
        <p>Photography credits are shown on the activity board.</p>
      </footer>
    </main>
  )
}

export default App
