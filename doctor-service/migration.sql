-- Migration script to update doctors table for specialization entity
-- Step 1: Add specialization_id column (nullable first)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialization_id INTEGER;

-- Step 2: Create foreign key constraint (if specializations table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'specializations') THEN
        -- Add foreign key constraint
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_doctors_specialization'
        ) THEN
            ALTER TABLE doctors 
            ADD CONSTRAINT fk_doctors_specialization 
            FOREIGN KEY (specialization_id) REFERENCES specializations(id);
        END IF;
    END IF;
END $$;

-- Step 3: Migrate existing specialization string values to specialization_id
-- This will match specialization names and set the ID
UPDATE doctors d
SET specialization_id = s.id
FROM specializations s
WHERE d.specialization = s.name
  AND d.specialization_id IS NULL;

-- Step 4: For doctors without matching specialization, create a default one or use first active
-- If no matching specialization found, use the first active specialization
UPDATE doctors d
SET specialization_id = (
    SELECT id FROM specializations WHERE active = true ORDER BY id LIMIT 1
)
WHERE d.specialization_id IS NULL
  AND EXISTS (SELECT 1 FROM specializations WHERE active = true);

-- Step 5: Make specialization_id NOT NULL (after migration)
-- First, ensure all doctors have a specialization_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM doctors WHERE specialization_id IS NULL) THEN
        RAISE EXCEPTION 'Cannot make specialization_id NOT NULL: some doctors still have NULL specialization_id';
    END IF;
    
    -- Remove NOT NULL constraint temporarily if exists, then add it back
    ALTER TABLE doctors ALTER COLUMN specialization_id SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        -- If constraint already exists or other error, continue
        NULL;
END $$;

-- Step 6: Drop old specialization column (optional - comment out if you want to keep it for reference)
-- ALTER TABLE doctors DROP COLUMN IF EXISTS specialization;

