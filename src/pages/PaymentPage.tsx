import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const PaymentPage = () => {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in.');
      return;
    }

    if (!name || !cardNumber || !expiry || !cvv) {
      setError('Please fill in all fields.');
      return;
    }

    if (cardNumber.length < 12 || cvv.length < 3) {
      setError('Invalid card details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const last4 = cardNumber.slice(-4);
      const { error: insertError } = await supabase
        .from('payment_details')
        .insert({
          user_id: user.id,
          name,
          card_last4: last4,
          expiry,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/activities');  // Navigate to /activities route after success
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to save payment details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Enter Card Details</h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm">
            Payment successful!
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Cardholder Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Card Number</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-1"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              required
              maxLength={16}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Expiry (MM/YY)</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 mt-1"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">CVV</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mt-1"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength={4}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded mt-4"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
