-- Create extras table for additional demo orders when needed
-- Only used when fulfillment workflows require more orders than real participants + host

DO $$ 
BEGIN
    -- Create extras table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'extras') THEN
        CREATE TABLE public.extras (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            company VARCHAR(100) DEFAULT 'ShipHero',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add comment
        COMMENT ON TABLE public.extras IS 'Demo customers used for additional orders when fulfillment workflows need more orders than real participants + host';

        -- Insert common demo names
        INSERT INTO public.extras (first_name, last_name, email) VALUES
            ('John', 'Smith', 'john.smith@shiphero.com'),
            ('Sarah', 'Johnson', 'sarah.johnson@shiphero.com'),
            ('Michael', 'Williams', 'michael.williams@shiphero.com'),
            ('Emily', 'Brown', 'emily.brown@shiphero.com'),
            ('David', 'Jones', 'david.jones@shiphero.com'),
            ('Jessica', 'Garcia', 'jessica.garcia@shiphero.com'),
            ('Christopher', 'Miller', 'christopher.miller@shiphero.com'),
            ('Ashley', 'Davis', 'ashley.davis@shiphero.com'),
            ('Matthew', 'Rodriguez', 'matthew.rodriguez@shiphero.com'),
            ('Amanda', 'Martinez', 'amanda.martinez@shiphero.com'),
            ('Daniel', 'Hernandez', 'daniel.hernandez@shiphero.com'),
            ('Jennifer', 'Lopez', 'jennifer.lopez@shiphero.com'),
            ('Joshua', 'Gonzalez', 'joshua.gonzalez@shiphero.com'),
            ('Michelle', 'Wilson', 'michelle.wilson@shiphero.com'),
            ('Andrew', 'Anderson', 'andrew.anderson@shiphero.com'),
            ('Stephanie', 'Thomas', 'stephanie.thomas@shiphero.com'),
            ('Ryan', 'Taylor', 'ryan.taylor@shiphero.com'),
            ('Nicole', 'Moore', 'nicole.moore@shiphero.com'),
            ('Brandon', 'Jackson', 'brandon.jackson@shiphero.com'),
            ('Rachel', 'Martin', 'rachel.martin@shiphero.com'),
            ('Kevin', 'Lee', 'kevin.lee@shiphero.com'),
            ('Lauren', 'Perez', 'lauren.perez@shiphero.com'),
            ('Jason', 'Thompson', 'jason.thompson@shiphero.com'),
            ('Megan', 'White', 'megan.white@shiphero.com'),
            ('Justin', 'Harris', 'justin.harris@shiphero.com'),
            ('Brittany', 'Sanchez', 'brittany.sanchez@shiphero.com'),
            ('Tyler', 'Clark', 'tyler.clark@shiphero.com'),
            ('Samantha', 'Ramirez', 'samantha.ramirez@shiphero.com'),
            ('Nathan', 'Lewis', 'nathan.lewis@shiphero.com'),
            ('Kayla', 'Robinson', 'kayla.robinson@shiphero.com'),
            ('Aaron', 'Walker', 'aaron.walker@shiphero.com'),
            ('Alexis', 'Young', 'alexis.young@shiphero.com'),
            ('Zachary', 'Allen', 'zachary.allen@shiphero.com'),
            ('Danielle', 'King', 'danielle.king@shiphero.com'),
            ('Adam', 'Wright', 'adam.wright@shiphero.com'),
            ('Courtney', 'Scott', 'courtney.scott@shiphero.com'),
            ('Jonathan', 'Torres', 'jonathan.torres@shiphero.com'),
            ('Heather', 'Nguyen', 'heather.nguyen@shiphero.com'),
            ('Jeremy', 'Hill', 'jeremy.hill@shiphero.com'),
            ('Crystal', 'Flores', 'crystal.flores@shiphero.com'),
            ('Benjamin', 'Green', 'benjamin.green@shiphero.com'),
            ('Amber', 'Adams', 'amber.adams@shiphero.com'),
            ('Jacob', 'Nelson', 'jacob.nelson@shiphero.com'),
            ('Tiffany', 'Baker', 'tiffany.baker@shiphero.com'),
            ('Anthony', 'Hall', 'anthony.hall@shiphero.com'),
            ('Kimberly', 'Rivera', 'kimberly.rivera@shiphero.com'),
            ('Mark', 'Campbell', 'mark.campbell@shiphero.com'),
            ('Lindsay', 'Mitchell', 'lindsay.mitchell@shiphero.com'),
            ('Steven', 'Carter', 'steven.carter@shiphero.com'),
            ('Melissa', 'Roberts', 'melissa.roberts@shiphero.com');

        RAISE NOTICE 'Created extras table with % demo customers', (SELECT COUNT(*) FROM public.extras);
    ELSE
        RAISE NOTICE 'Extras table already exists, skipping creation';
    END IF;
END $$;
