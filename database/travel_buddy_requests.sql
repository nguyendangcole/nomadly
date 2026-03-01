-- Create travel_buddy_requests table
CREATE TABLE travel_buddy_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_travel_buddy_requests_trip_id ON travel_buddy_requests(trip_id);
CREATE INDEX idx_travel_buddy_requests_requester_id ON travel_buddy_requests(requester_id);
CREATE INDEX idx_travel_buddy_requests_status ON travel_buddy_requests(status);
CREATE INDEX idx_travel_buddy_requests_created_at ON travel_buddy_requests(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE travel_buddy_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view requests for their own trips or requests they sent
CREATE POLICY "Users can view travel buddy requests for their trips or sent by them"
ON travel_buddy_requests FOR SELECT
USING (
    requester_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM trips 
        WHERE trips.id = travel_buddy_requests.trip_id 
        AND trips.user_id = auth.uid()
    )
);

-- Users can create requests (only for trips they don't own)
CREATE POLICY "Users can create travel buddy requests"
ON travel_buddy_requests FOR INSERT
WITH CHECK (
    requester_id = auth.uid()
    AND NOT EXISTS (
        SELECT 1 FROM trips 
        WHERE trips.id = travel_buddy_requests.trip_id 
        AND trips.user_id = auth.uid()
    )
);

-- Users can update requests (only trip owners can accept/decline)
CREATE POLICY "Trip owners can update travel buddy requests"
ON travel_buddy_requests FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trips 
        WHERE trips.id = travel_buddy_requests.trip_id 
        AND trips.user_id = auth.uid()
    )
);

-- Users can delete their own requests
CREATE POLICY "Users can delete their own travel buddy requests"
ON travel_buddy_requests FOR DELETE
USING (requester_id = auth.uid());
