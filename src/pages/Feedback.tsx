import { Star } from 'lucide-react';
import { feedbackItems } from '../data/sampleData';
import Badge from '../components/Badge';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={13}
          fill={i <= rating ? '#c8972b' : 'none'}
          stroke={i <= rating ? '#c8972b' : 'var(--border)'}
        />
      ))}
    </div>
  );
}

const sentimentBadge: Record<string, 'success' | 'neutral' | 'error'> = {
  positive: 'success',
  neutral: 'neutral',
  negative: 'error',
};

export default function Feedback() {
  const avg = (feedbackItems.reduce((s, f) => s + f.rating, 0) / feedbackItems.length).toFixed(1);
  const positiveCount = feedbackItems.filter(f => f.sentiment === 'positive').length;
  const negativeCount = feedbackItems.filter(f => f.sentiment === 'negative').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold mb-1" style={{ color: '#c8972b' }}>{avg}</div>
          <StarRating rating={Math.round(Number(avg))} />
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Average Rating</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#4caf50' }}>{positiveCount}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Positive Reviews</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#f44336' }}>{negativeCount}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Negative Reviews</div>
        </div>
      </div>

      <div className="space-y-3">
        {feedbackItems.map(item => (
          <div key={item.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e, #e94560)' }}
                >
                  {item.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.user}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    reviewed <span style={{ color: '#e94560' }}>{item.bot}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StarRating rating={item.rating} />
                <Badge label={item.sentiment} variant={sentimentBadge[item.sentiment]} />
                <span className="text-xs" style={{ color: 'var(--text-light)' }}>{item.date}</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              "{item.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
