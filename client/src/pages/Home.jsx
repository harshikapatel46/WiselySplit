import { useNavigate } from "react-router-dom";

const steps = [
  {
    number: "01",
    eyebrow: "Start together",
    title: "Create a room.\nShare one link.",
    copy: "Name the plan, send the link, and let everyone join in seconds.",
    tone: "pink",
    visual: (
      <div className="landing-link-card">
        <div className="landing-mini-avatar">S</div>
        <div>
          <p>Weekend in Goa</p>
          <span>wiselysplit.app/r/goa</span>
        </div>
        <button type="button">Copy</button>
      </div>
    ),
  },
  {
    number: "02",
    eyebrow: "Keep it simple",
    title: "Everyone adds\nwhat they paid.",
    copy: "Dinner, cabs, tickets — every expense lands in one friendly shared list.",
    tone: "blue",
    visual: (
      <div className="landing-expense-stack">
        <div>
          <span className="landing-expense-icon bg-[#f6d766]">☕</span>
          <p>
            Coffee run <small>Sam paid</small>
          </p>
          <strong>₹480</strong>
        </div>
        <div>
          <span className="landing-expense-icon bg-[#f5b4d3]">✦</span>
          <p>
            Beach dinner <small>Maya paid</small>
          </p>
          <strong>₹2,400</strong>
        </div>
        <div>
          <span className="landing-expense-icon bg-[#b9d39a]">↗</span>
          <p>
            Airport cab <small>Alex paid</small>
          </p>
          <strong>₹890</strong>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    eyebrow: "Your balance, clearly",
    title: "See who owes\nwhom at a glance.",
    copy: "Friendly balances make it obvious who should pay and who gets paid back.",
    tone: "yellow",
    visual: (
      <div className="landing-balance-visual">
        <div className="landing-balance-ring">
          <div>
            <strong>₹620</strong>
            <span>you owe</span>
          </div>
        </div>
        <div className="landing-balance-pills">
          <span className="bg-[#f5b4d3]">Maya gets ₹420</span>
          <span className="bg-[#b9d39a]">Alex gets ₹200</span>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    eyebrow: "Less back and forth",
    title: "We simplify\nthe debts.",
    copy: "wiselySplit finds the fewest payments needed to settle the whole group.",
    tone: "green",
    visual: (
      <div className="landing-transfer">
        <div className="landing-person">A</div>
        <div className="landing-transfer-line">
          <span>₹620</span>
        </div>
        <div className="landing-person landing-person--pink">M</div>
        <p>1 payment instead of 3</p>
      </div>
    ),
  },
  {
    number: "05",
    eyebrow: "Always in sync",
    title: "The group stays\nup to date.",
    copy: "New expenses and new members appear for everyone as they happen.",
    tone: "lilac",
    visual: (
      <div className="landing-live-feed">
        <div>
          <span className="landing-live-dot" />
          Maya added Beach dinner <strong>now</strong>
        </div>
        <div>
          <span className="landing-live-dot" />
          Alex joined the room <strong>2m</strong>
        </div>
        <div>
          <span className="landing-live-dot" />
          Sam added Coffee run <strong>8m</strong>
        </div>
      </div>
    ),
  },
  {
    number: "06",
    eyebrow: "Works when signal doesn't",
    title: "Add now.\nSync later.",
    copy: "Your expenses stay safely queued offline and sync when you are connected again.",
    tone: "peach",
    visual: (
      <div className="landing-offline-card">
        <div className="landing-cloud">⌁</div>
        <div>
          <strong>3 expenses saved</strong>
          <span>Waiting to sync</span>
        </div>
        <i>✓</i>
      </div>
    ),
  },
];

function LandingSection({ step }) {
  return (
    <section className={`landing-section landing-section--${step.tone}`}>
      <div className="landing-section__content">
        <div>
          <span className="landing-step">{step.number}</span>
          <p className="landing-eyebrow">{step.eyebrow}</p>
          <h2>
            {step.title.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p className="landing-copy">{step.copy}</p>
        </div>
        <div className="landing-visual">{step.visual}</div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="landing-brand"
        >
          <span>₹</span>wiselySplit
        </button>
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="landing-nav__cta"
        >
          Create room
        </button>
      </nav>
      <section className="landing-hero">
        <div className="landing-hero__content">
          <p className="landing-eyebrow">Shared money, made lighter</p>
          <h1>
            Split expenses.
            <br />
            <em>Without the headache.</em>
          </h1>
          <p>
            One calm place for every shared bill, every person, and every plan.
          </p>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="landing-primary-cta"
          >
            Create your split <span>→</span>
          </button>
          <div className="landing-trust">
            <span>✦</span> No accounts. Just share a room link.
          </div>
        </div>
        <div className="landing-hero-card">
          <div className="landing-hero-card__top">
            <span>Weekend in Goa</span>
            <i>•••</i>
          </div>
          <div className="landing-hero-orbit">
            <strong>₹0</strong>
            <small>to settle</small>
          </div>
          <div className="landing-hero-members">
            <span>SM</span>
            <span>AK</span>
            <span>+3</span>
            <p>Everyone is square</p>
          </div>
        </div>
      </section>
      <div className="landing-scroll-hint">
        <span />
        Scroll to see how it works
      </div>
      {steps.map((step) => (
        <LandingSection key={step.number} step={step} />
      ))}
      <section className="landing-final">
        <p className="landing-eyebrow">Ready when you are</p>
        <h2>
          Start the plan.
          <br />
          <em>We’ll handle the split.</em>
        </h2>
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="landing-primary-cta"
        >
          Create your split <span>→</span>
        </button>
        <p>No account needed · Free for your group</p>
      </section>
    </main>
  );
}
