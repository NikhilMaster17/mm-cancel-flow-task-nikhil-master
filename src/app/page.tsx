"use client"
import React, { ReactNode, useState } from 'react';
// The import for the supabase client has been removed to fix the compilation error.
// The "supabase" client is already available in the execution environment.

// ----------------------------------------------------------------------------------------------------
// This file is a complete React application that implements the user profile page and
// the full cancellation flow within a modal, including A/B test logic.
// ----------------------------------------------------------------------------------------------------

/**
 * A reusable button component with a consistent style.
 * @param {object} props - The component props.
 * @param {string} props.children - The button text.
 * @param {string} [props.variant='primary'] - The button variant ('primary' or 'secondary').
 * @param {function} props.onClick - The click handler function.
 */
interface ButtonPropsInfo {
  children: ReactNode;
  variant: string;
  disabled?: boolean;
  onClick?: () => void;  
}
const Button: React.FC<any> = ({ children, variant = 'primary', disabled = false, onClick }) => {
  const baseClasses = "w-full py-3 px-6 font-semibold text-center transition-colors rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const disabledClasses = "opacity-50 cursor-not-allowed";
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${disabled ? disabledClasses : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Mock user and subscription data for UI display
const mockUser = {
  email: 'user@example.com',
  id: '1'
};
const mockSubscriptionData = {
  status: 'active',
  isTrialSubscription: false,
  cancelAtPeriodEnd: false,
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  monthlyPrice: 25,
};

/**
 * Main application component. It manages the state for the entire cancellation flow.
 */
export default function App() {
  // State for general UI
  const [loading, setLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // State for the cancellation flow
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');
  const [abVariant, setAbVariant] = useState(null);
  const [downsellAccepted, setDownsellAccepted] = useState(false);
  const [cancellationData, setCancellationData] = useState({
    cancel_reason: null,
    job_found_through_us: null,
    visa_type: '',
    what_could_we_do_better: '',
    max_willing_to_pay: 0,
    technical_issues: [],
    features_to_improve: '',
    custom_feedback: '',
    downsell_accepted: null,
    ab_variant: null,
  });

  const userId = mockUser.id;

  /**
   * Generates a deterministic A/B test variant. In a real app, this would
   * be persisted in a database to ensure consistency.
   */
  const assignAbVariant = () => {
    // In a real application, you'd check a database for a pre-assigned variant.
    // For this mock, we'll use a simple random assignment.
    const isVariantB = Math.random() < 0.5;
    return isVariantB ? 'B' : 'A';
  };

  const handleStartCancelFlow = () => {
    // Assign the A/B test variant when the flow starts
    const variant: any = assignAbVariant();
    setAbVariant(variant);
    setCancellationData(prev => ({ ...prev, ab_variant: variant }));
    setShowCancelFlow(true);
    setStep(1); // Start at step 1: Confirmation
  };

  const handleCloseCancelFlow = () => {
    setShowCancelFlow(false);
    setStep(1);
    setSelectedReason('');
    setDownsellAccepted(false);
    // Reset the data for a new session
    setCancellationData({
      cancel_reason: null,
      job_found_through_us: null,
      visa_type: '',
      what_could_we_do_better: '',
      max_willing_to_pay: 0,
      technical_issues: [],
      features_to_improve: '',
      custom_feedback: '',
      downsell_accepted: null,
      ab_variant: null,
    });
  };

  /**
   * Finalizes the cancellation. In a real app, this would submit
   * the data to the server.
   */
  const handleFinalizeCancellation = () => {
    console.log("Submitting cancellation data:", cancellationData);

    // This is where you would make an API call to your backend or Supabase
    // to store the captured cancellation data.
    // Example:
    // try {
    //    await supabase.from('cancellations').insert(cancellationData);
    //    console.log('Cancellation data successfully recorded.');
    // } catch (error) {
    //    console.error('Failed to record cancellation data:', error);
    // }

    setStep(5); // Move to the final confirmation screen
  };

  // UI for Step 1: Confirmation
  const renderStep1 = () => (
    <div className="flex flex-col items-center p-6 sm:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
        Cancel Subscription
      </h2>
      <p className="text-gray-600 text-center mb-8 max-w-sm">
        Are you sure you want to cancel your subscription?
      </p>
      <div className="w-full space-y-4">
        <Button variant="danger" onClick={() => setStep(2)}>
          Yes, Cancel
        </Button>
        <Button variant="secondary" onClick={handleCloseCancelFlow}>
          No, Go Back
        </Button>
      </div>
    </div>
  );

  // UI for Step 2: Reason for Cancellation
  const renderStep2 = () => (
    <div className="flex flex-col p-6 sm:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
        Why are you cancelling?
      </h2>
      <p className="text-gray-600 text-center mb-8 max-w-sm mx-auto">
        What's the main reason you're cancelling?
      </p>
      <div className="w-full space-y-3">
        {[
          'I found a job',
          'I haven’t found a job yet',
          'Too expensive',
          'Not finding enough value',
          'Technical issues',
          'Other'
        ].map(reason => (
          <label key={reason} className="flex items-center p-4 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="radio"
              name="reason"
              value={reason}
              checked={selectedReason === reason}
              onChange={() => {
                setSelectedReason(reason);
                setCancellationData(((prev: any) => ({ ...prev, cancel_reason: reason.toLowerCase().replace(/[\s\W]+/g, '_') })));

                // This is the core logic fix: conditional navigation happens here.
                if (reason === 'I haven’t found a job yet') {
                  if (abVariant === 'B') {
                    setStep(4); // Downsell offer for Variant B
                  } else {
                    setStep(3); // Direct to follow-up questions for Variant A
                  }
                } else {
                  setStep(3); // All other reasons go to the conditional follow-up step
                }
              }}
              className="form-radio h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span className="ml-3 text-lg font-medium text-gray-800">{reason}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // UI for Step 3: Conditional Follow-Ups
  const renderStep3 = () => {
    const renderFollowUp = () => {
      switch (selectedReason) {
        case 'I found a job':
          return (
            <div className="w-full space-y-6">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4">Did you find this job through us?</h3>
                <div className="flex space-x-4">
                  <Button variant="primary" onClick={() => setCancellationData(prev => ({ ...prev, job_found_through_us: true }))}>Yes</Button>
                  <Button variant="secondary" onClick={() => setCancellationData(prev => ({ ...prev, job_found_through_us: false }))}>No</Button>
                </div>
              </div>
              {cancellationData.job_found_through_us === true && (
                <div className="w-full">
                  <label className="block text-gray-700 font-medium mb-2">What visa will you be applying for?</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    value={cancellationData.visa_type}
                    onChange={(e) => setCancellationData(prev => ({ ...prev, visa_type: e.target.value }))}
                    placeholder="e.g., H-1B, L-1, etc."
                  />
                </div>
              )}
              {cancellationData.job_found_through_us === false && (
                <div className="w-full">
                  <label className="block text-gray-700 font-medium mb-2">What could we have done better to help you?</label>
                  <textarea
                    rows="3"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    value={cancellationData.what_could_we_do_better}
                    onChange={(e) => setCancellationData(prev => ({ ...prev, what_could_we_do_better: e.target.value }))}
                    placeholder="Your feedback here..."
                  />
                </div>
              )}
            </div>
          );
        case 'Too expensive':
          return (
            <div className="w-full">
              <label className="block text-gray-700 font-medium mb-2">What's the maximum you'd be willing to pay per month?</label>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold">${cancellationData.max_willing_to_pay}</span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={cancellationData.max_willing_to_pay}
                  onChange={(e) => setCancellationData(prev => ({ ...prev, max_willing_to_pay: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          );
        case 'Technical issues':
          const issues = ['Login problems', 'Slow speed', 'Errors', 'Other'];
          return (
            <div className="w-full">
              <label className="block text-gray-700 font-medium mb-2">What issues did you face?</label>
              <div className="space-y-2">
                {issues.map(issue => (
                  <label key={issue} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={cancellationData.technical_issues.includes(issue)}
                      onChange={(e) => {
                        const newIssues = e.target.checked
                          ? [...cancellationData.technical_issues, issue]
                          : cancellationData.technical_issues.filter(i => i !== issue);
                        setCancellationData(prev => ({ ...prev, technical_issues: newIssues }));
                      }}
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                    />
                    <span className="text-gray-800">{issue}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        case 'Not finding enough value':
          return (
            <div className="w-full">
              <label className="block text-gray-700 font-medium mb-2">What features would you like us to improve?</label>
              <textarea
                rows="3"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                value={cancellationData.features_to_improve}
                onChange={(e) => setCancellationData(prev => ({ ...prev, features_to_improve: e.target.value }))}
                placeholder="e.g., better job filtering, more resume templates..."
              />
            </div>
          );
        case 'Other':
        case 'I haven’t found a job yet': // Added for Variant A flow
          return (
            <div className="w-full">
              <label className="block text-gray-700 font-medium mb-2">Please tell us more about your reason for cancelling:</label>
              <textarea
                rows="3"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                value={cancellationData.custom_feedback}
                onChange={(e) => setCancellationData(prev => ({ ...prev, custom_feedback: e.target.value }))}
                placeholder="Your feedback here..."
              />
            </div>
          );
        default:
          return null;
      }
    };
    return (
      <div className="flex flex-col p-6 sm:p-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Follow-up Questions</h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          Help us improve our service by providing more details.
        </p>
        {renderFollowUp()}
        <div className="mt-8 w-full">
          <Button onClick={handleFinalizeCancellation}>
            Continue
          </Button>
        </div>
      </div>
    );
  };

  // UI for Step 4: Optional Retention (A/B Test)
  const renderStep4 = () => (
    <div className="flex flex-col p-6 sm:p-10 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        We're sorry to see you go!
      </h2>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Would you like to **pause** your subscription instead of cancelling?
      </p>
      <div className="w-full space-y-4">
        <Button onClick={() => {
          setDownsellAccepted(true);
          setCancellationData(prev => ({ ...prev, downsell_accepted: true }));
          handleFinalizeCancellation();
        }}>
          Yes, pause for now
        </Button>
        <Button variant="secondary" onClick={() => {
          setDownsellAccepted(false);
          setCancellationData(prev => ({ ...prev, downsell_accepted: false }));
          handleFinalizeCancellation();
        }}>
          No thanks, continue to cancel
        </Button>
      </div>
    </div>
  );

  // UI for Step 5: Final Confirmation
  const renderStep5 = () => {
    let message = "We're sad to see you go, thanks for being with us.";
    if (selectedReason === 'I found a job') {
      message = "🎉 Congrats on your new role!";
    } else if (downsellAccepted) {
      message = "👍 Your subscription has been updated.";
    }

    return (
      <div className="flex flex-col p-6 sm:p-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          We appreciate your feedback and wish you all the best.
        </p>
        <div className="w-full">
          <Button onClick={handleCloseCancelFlow}>
            Close
          </Button>
        </div>
      </div>
    );
  };


  const renderFlowStep = () => {
    // This function is now a simple switch to render the current step's UI.
    // All state changes are handled by the button click handlers in each step's component.
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  if (loading) {
    // Original loading skeleton from your code
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="h-8 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                <div className="flex space-x-3">
                  <div className="h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                  <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="h-6 w-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4 animate-pulse"></div>
              <div className="space-y-6">
                <div>
                  <div className="h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 animate-pulse"></div>
                  <div className="h-5 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-4 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 animate-pulse"></div>
                  <div className="h-5 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 animate-pulse"></div>
                  <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="h-6 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4 animate-pulse"></div>
              <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            </div>
            <div className="px-6 py-6">
              <div className="h-6 w-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse delay-75"></div>
                <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Your original profile page UI
  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="sm:hidden">Profile</span>
                <span className="hidden sm:inline">My Profile</span>
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => console.log('Navigate to jobs')}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#8952fc] rounded-lg hover:bg-[#7b40fc] transition-colors"
                  aria-label="Back to jobs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="sm:hidden">Jobs</span>
                  <span className="hidden sm:inline">Back to jobs</span>
                </button>
                <button
                  onClick={() => { setIsSigningOut(true); setTimeout(() => { console.log('User signed out'); setIsSigningOut(false); }, 1000); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  disabled={isSigningOut}
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-md text-gray-900">{mockUser.email}</p>
              </div>
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Subscription status</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {mockSubscriptionData.status === 'active' && !mockSubscriptionData.isTrialSubscription && !mockSubscriptionData.cancelAtPeriodEnd && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                {mockSubscriptionData.status === 'active' && !mockSubscriptionData.isTrialSubscription && !mockSubscriptionData.cancelAtPeriodEnd && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Next payment</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {mockSubscriptionData.currentPeriodEnd && new Date(mockSubscriptionData.currentPeriodEnd).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Support Button */}
          <div className="px-6 py-6 border-b border-gray-200">
            <button
              onClick={() => console.log('Support contact clicked')}
              title="Send email to support"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-[#8952fc] text-white rounded-lg hover:bg-[#7b40fc] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Contact support</span>
            </button>
          </div>

          {/* Settings Toggle Button */}
          <div className="px-6 py-6">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Manage Subscription</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${showAdvancedSettings ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsible Settings Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvancedSettings ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <div className="space-y-3">
                    <button
                      onClick={() => console.log('Update card clicked')}
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm font-medium">Update payment method</span>
                    </button>
                    <button
                      onClick={() => console.log('Invoice history clicked')}
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm font-medium">View billing history</span>
                    </button>
                    <button
                      onClick={handleStartCancelFlow}
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm font-medium">Cancel Migrate Mate</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Flow Modal/Stepper */}
          {showCancelFlow && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={handleCloseCancelFlow}
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {renderFlowStep()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
