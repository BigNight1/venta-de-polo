import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/FirebaseAuthContext';
import { StarRating } from '../../lib/StarRating';

interface Review {
  _id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
  likes: number;
  verified: boolean;
}

interface ReviewsProps {
  productId: string;
  initialReviews?: Review[];
  loading?: boolean;
  showSummary?: boolean;
}

export const Reviews: React.FC<ReviewsProps> = ({ productId, initialReviews = [], loading: loadingProp = false, showSummary = false }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(loadingProp);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    setReviews(initialReviews);
    setLoading(loadingProp);
  }, [initialReviews, loadingProp]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const review = {
      productId,
      userId: user.uid,
      userName: user.displayName || 'Anónimo',
      userAvatar: user.photoURL || undefined,
      rating: newReview.rating,
      comment: newReview.comment,
      verified: true,
      likes: 0
    };
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (res.ok) {
      const saved = await res.json();
      setReviews([saved, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      setShowForm(false);
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="space-y-6">
      {/* Resumen de reseñas solo si showSummary */}
      {showSummary && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={averageRating} />
              <div className="text-sm text-gray-600 mt-1">
                {reviews.length} reseñas
              </div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm w-2">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Add Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reseñas de clientes</h3>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Escribir reseña</span>
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && user && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Escribir una reseña</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Calificación</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                    className={`text-2xl ${
                      rating <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comentario</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Comparte tu experiencia con este producto..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Publicar reseña
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && <div>Cargando reseñas...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {reviews.map(review => (
          <div key={review._id} className="bg-white border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {review.userAvatar ? (
                  <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {review.userName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.userName}</span>
                    {review.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm text-gray-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }) : ''}
                    </span>
                  </div>
                </div>
              </div>
              {/* Botones de editar/eliminar solo para el autor */}
              {user && user.uid === (review as any).userId && (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === review._id ? null : review._id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showDropdown === review._id && (
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                      <button
                        onClick={() => {
                          setEditComment(review.comment);
                          setEditRating(review.rating);
                          setEditingId(review._id);
                          setShowDropdown(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={async () => {
                          setShowDropdown(null);
                          if (confirm('¿Seguro que quieres eliminar esta reseña?')) {
                            await fetch(`${import.meta.env.VITE_API_URL}/reviews/${review._id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                            });
                            setReviews(reviews.filter(r => r._id !== review._id));
                          }
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Formulario de edición inline */}
            {editingId === review._id ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch(`${import.meta.env.VITE_API_URL}/reviews/${review._id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ comment: editComment, rating: editRating })
                  });
                  setReviews(reviews.map(r => r._id === review._id ? { ...r, comment: editComment, rating: editRating } : r));
                  setEditingId(null);
                }}
                className="space-y-2 mt-2"
              >
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRating(r)}
                      className={`text-xl ${r <= editRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                    >★</button>
                  ))}
                </div>
                <textarea
                  value={editComment}
                  onChange={e => setEditComment(e.target.value)}
                  className="w-full border rounded p-2"
                  rows={2}
                  required
                />
                <div className="flex space-x-2">
                  <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Guardar</button>
                  <button type="button" onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded">Cancelar</button>
                </div>
              </form>
            ) : (
              <p className="text-gray-700 mt-2 whitespace-pre-line">{review.comment}</p>
            )}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Útil ({review.likes})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 