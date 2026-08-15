import ReviewsContent from '@/components/dashboard/ReviewsContent';

/**
 * Customer Success must only present persisted business data. The previous
 * implementation mixed real clients with demo feedbacks and local-only status
 * mutations, which made successful toasts disappear after a refresh.
 */
const CustomerSuccessContent = () => <ReviewsContent />;

export default CustomerSuccessContent;
