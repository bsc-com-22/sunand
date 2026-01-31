-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    admin_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to track admin activity
CREATE OR REPLACE FUNCTION log_admin_action(
    action_text TEXT,
    e_type TEXT,
    e_id TEXT,
    extra_details JSONB DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
    INSERT INTO audit_logs (admin_id, admin_email, action, entity_type, entity_id, details)
    VALUES (
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        action_text,
        e_type,
        e_id,
        extra_details
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
