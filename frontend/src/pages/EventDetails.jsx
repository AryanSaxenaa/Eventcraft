import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import eventService from '../services/eventService';
import ticketService from '../services/ticketService';
import { useNotification } from '../components/NotificationContext';
import FavoriteButton from '../components/FavoriteButton';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const user = useSelector((state) => state.user.user);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState('details'); // details, tickets, payment, confirmation
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch event data when component mounts
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        console.log('Fetching event with ID:', id);
        
        const eventData = await eventService.getEvent(id);
        console.log('Event data received:', eventData);
        
        // Ensure the event has both id and _id properties
        if (eventData && !eventData._id && eventData.id) {
          eventData._id = eventData.id;
        }
        if (eventData && !eventData.id && eventData._id) {
          eventData.id = eventData._id;
        }
        
        // Ensure other required properties
        if (!eventData.attendees) eventData.attendees = [];
        if (!eventData.capacity) eventData.capacity = 100;
        
        setEvent(eventData);
        setError(null);
        
        // Set up ticket types based on event data
        if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
          setTicketTypes(eventData.ticketTypes);
          setSelectedTicketType(eventData.ticketTypes[0]);
        } else {
          // Create a default ticket type from event data
          const defaultTicketType = {
            id: 'general-admission',
            name: 'General Admission',
            price: eventData.ticketPrice || eventData.price || 0,
            available: (eventData.capacity || 100) - (eventData.attendees?.length || 0),
            description: 'Standard admission to the event'
          };
          setTicketTypes([defaultTicketType]);
          setSelectedTicketType(defaultTicketType);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  // Handle registration step
  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Move to ticket selection step
    setStep('tickets');
  };

  // Handle ticket selection
  const handleTicketSelect = (ticketType) => {
    setSelectedTicketType(ticketType);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!selectedTicketType) {
      showError('Please select a ticket type');
      return;
    }
    setStep('payment');
  };

  // Handle payment submission
  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      
      console.log('Processing registration for event:', id);
      console.log('Selected ticket type:', selectedTicketType);
      console.log('Quantity:', quantity);
      
      // Register for the event (this creates the ticket automatically)
      const registrationResponse = await eventService.registerForEvent(id);
      console.log('Successfully registered for event:', registrationResponse);
      
      success('Registration successful! You are now registered for the event.');
      setStep('confirmation');
    } catch (err) {
      console.error('Registration error:', err);
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle going back to event details
  const handleBackToDetails = () => {
    setStep('details');
  };

  // Handle going to dashboard
  const handleGoToDashboard = () => {
    navigate('/attendee/dashboard');
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Date TBD';
    }
  };

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return 'Time TBD';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Time TBD';
    }
  };

  // Format price helper
  const formatPrice = (price) => {
    if (price === 0 || price === '0') return 'Free';
    if (!price) return 'Free';
    
    // Ensure price is a number
    const numericPrice = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(numericPrice)) return 'Free';
    
    return `$${numericPrice.toFixed(2)}`;
  };

  // Format categories for display
  const formatCategories = (categories) => {
    if (!categories) return 'General';
    
    if (Array.isArray(categories)) {
      return categories.map(category => 
        category.charAt(0).toUpperCase() + category.slice(1)
      ).join(', ');
    }
    
    if (typeof categories === 'string') {
      return categories.charAt(0).toUpperCase() + categories.slice(1);
    }
    
    return 'General';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Event not found'}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if user is already registered
  const isRegistered = user && event.attendees && 
    (event.attendees.includes(user.id) || event.attendees.includes(user._id));

  // Check if user is the organizer of this event
  const isOrganizer = user && event.organizer && 
    ((typeof event.organizer === 'string' && event.organizer === user._id) ||
     (typeof event.organizer === 'object' && event.organizer._id === user._id));

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  // Render based on current step
  if (step === 'tickets') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded shadow overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-6">Select Tickets</h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Event: {event.title}</h2>
              <p className="text-gray-600">📅 {formatDate(event.date)} at 🕒 {formatTime(event.date)}</p>
              <p className="text-gray-700">📍 {event.location}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium">Available Ticket Types</h3>
              
              {ticketTypes.map((ticket) => (
                <div 
                  key={ticket.id}
                  onClick={() => handleTicketSelect(ticket)}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedTicketType && selectedTicketType.id === ticket.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{ticket.name}</h4>
                      <p className="text-sm text-gray-600">{ticket.description}</p>
                      {ticket.perks && ticket.perks.length > 0 && (
                        <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                          {ticket.perks.slice(0, 3).map((perk, idx) => (
                            <li key={idx}>{perk}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatPrice(ticket.price)}</p>
                      <p className="text-xs text-gray-500">
                        {ticket.available - ticket.sold} available
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center">
                <button 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="bg-gray-200 px-3 py-1 rounded-l"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max="10"
                  className="w-16 text-center border-t border-b py-1"
                />
                <button 
                  onClick={() => quantity < 10 && setQuantity(quantity + 1)}
                  className="bg-gray-200 px-3 py-1 rounded-r"
                >
                  +
                </button>
              </div>
            </div>
            
            {selectedTicketType && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span>Ticket Price:</span>
                  <span>{formatPrice(selectedTicketType.price)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>{formatPrice(selectedTicketType.price * quantity)}</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button 
                onClick={handleBackToDetails}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button 
                onClick={handleProceedToPayment}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded shadow overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-6">Payment</h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Event: {event.title}</h2>
              <p className="text-gray-600">📅 {formatDate(event.date)}</p>
              <p className="text-gray-700 mb-4">📍 {event.location}</p>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>{selectedTicketType.name} × {quantity}</span>
                  <span>{formatPrice(selectedTicketType.price * quantity)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>{formatPrice(selectedTicketType.price * quantity)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium">Payment Details</h3>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  defaultValue="4242 4242 4242 4242"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    defaultValue="12/25"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    defaultValue="123"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Name on Card</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  defaultValue={user?.name || ""}
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setStep('tickets')}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                disabled={processingPayment}
              >
                Back
              </button>
              <button 
                onClick={handlePayment}
                disabled={processingPayment}
                className={`flex-1 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition ${
                  processingPayment ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {processingPayment ? 'Processing...' : `Pay ${formatPrice(selectedTicketType.price * quantity)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded shadow overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your tickets have been confirmed and sent to your email.</p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6 max-w-md mx-auto text-left">
              <h2 className="font-semibold mb-2">{event.title}</h2>
              <p className="text-gray-600">📅 {formatDate(event.date)}</p>
              <p className="text-gray-700">📍 {event.location}</p>
              <div className="mt-2 pt-2 border-t">
                <p>{selectedTicketType.name} × {quantity}</p>
                <p className="font-bold mt-1">Total: {formatPrice(selectedTicketType.price * quantity)}</p>
              </div>
            </div>
            
            <button 
              onClick={handleGoToDashboard}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              View My Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow overflow-hidden">
        <img
          src={event.image || 'https://source.unsplash.com/1200x400/?event'}
          alt={event.title}
          className="w-full h-64 object-cover"
        />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-700 mb-2">{event.title}</h1>
              <p className="text-gray-600 mb-4">
                📅 {formatDate(event.date)} at 🕒 {formatTime(event.date)}
              </p>
            </div>
            <FavoriteButton 
              eventId={event._id || event.id} 
              size="lg" 
              className="ml-4 bg-white shadow-sm border border-gray-200" 
            />
          </div>
          <p className="text-gray-700 font-medium mb-2">📍 {event.location}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{event.description}</p>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-gray-700 font-medium">Price:</span> 
              <span className="ml-2 text-lg font-bold">
                {event.price === 0 || event.price === '0' ? 'Free' : 
                 event.price ? `$${typeof event.price === 'number' ? event.price.toFixed(2) : event.price}` : 
                 event.ticketPrice ? `$${typeof event.ticketPrice === 'number' ? event.ticketPrice.toFixed(2) : event.ticketPrice}` :
                 event.ticketTypes && event.ticketTypes[0]?.price ? `$${event.ticketTypes[0].price}` : 
                 'Free'}
              </span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Capacity:</span>
              <span className="ml-2">{event.attendees?.length || 0} / {event.capacity || 'Unlimited'}</span>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-gray-700 font-medium">Categories:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {event.categories && Array.isArray(event.categories) ? (
                event.categories.map((category, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                ))
              ) : event.category ? (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </span>
              ) : (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  General
                </span>
              )}
            </div>
          </div>

          {isOrganizer ? (
            <div className="space-y-4">
              <div className="bg-blue-100 text-blue-800 p-4 rounded mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">You are the organizer of this event</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => navigate(`/organizer/create-event?edit=${event._id || event.id}`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Event</span>
                </button>
                
                <button 
                  onClick={() => navigate(`/organizer/dashboard`)}
                  className="bg-green-600 text-white px-6 py-3 rounded font-medium hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <span>Manage Event</span>
                </button>
                
                <button 
                  onClick={() => navigate(`/organizer/dashboard`)}
                  className="bg-purple-600 text-white px-6 py-3 rounded font-medium hover:bg-purple-700 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>View Analytics</span>
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900 mb-2">Event Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Attendees:</span>
                    <span className="ml-1 font-medium">{event.attendees?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="ml-1 font-medium">{event.capacity || 'Unlimited'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-1 font-medium capitalize ${
                      event.status === 'published' ? 'text-green-600' : 
                      event.status === 'draft' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>{event.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Registration:</span>
                    <span className="ml-1 font-medium">
                      {event.attendees?.length >= event.capacity ? 'Full' : 'Open'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : isAdmin ? (
            <div className="space-y-4">
              <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-1.5a2.5 2.5 0 00-5 0l-.5 8.5a.5.5 0 001 0L16 15.5a2.5 2.5 0 000-5zm0 0h-5.5m0 0l-7-7 7 7z" />
                  </svg>
                  <span className="font-medium">Administrator View</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate(`/admin/moderation`)}
                  className="bg-red-600 text-white px-6 py-3 rounded font-medium hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Moderate Event</span>
                </button>
                
                <button 
                  onClick={() => navigate('/attendee/dashboard')}
                  className="bg-green-600 text-white px-6 py-3 rounded font-medium hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View as Attendee</span>
                </button>
              </div>
            </div>
          ) : isRegistered ? (
            <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">You are registered for this event!</span>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleRegister}
              disabled={registering || (event.attendees?.length >= event.capacity)}
              className={`w-full bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition ${
                registering ? 'opacity-75 cursor-not-allowed' : ''
              } ${(event.attendees?.length >= event.capacity) ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}
            >
              {registering ? 'Processing...' : (event.attendees?.length >= event.capacity) ? 'Event Full' : 'Register Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

