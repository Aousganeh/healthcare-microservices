-- Migration script to update doctors table for department entity
-- Step 1: Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITHOUT TIME ZONE,
    created_by VARCHAR(255),
    last_modified_date TIMESTAMP WITHOUT TIME ZONE,
    last_modified_by VARCHAR(255)
);

-- Step 2: Insert default departments from existing doctor departments
INSERT INTO departments (name, description, active, created_date, created_by, last_modified_date, last_modified_by)
SELECT DISTINCT 
    department,
    'Department for ' || department,
    TRUE,
    NOW(),
    'system',
    NOW(),
    'system'
FROM doctors
WHERE department IS NOT NULL
  AND department != ''
  AND NOT EXISTS (SELECT 1 FROM departments WHERE departments.name = doctors.department);

-- Step 3: Add department_id column to doctors table (nullable first)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS department_id INTEGER;

-- Step 4: Update existing doctors to link to departments
UPDATE doctors d
SET department_id = dept.id
FROM departments dept
WHERE d.department = dept.name
  AND d.department_id IS NULL;

-- Step 5: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_doctors_department'
    ) THEN
        ALTER TABLE doctors 
        ADD CONSTRAINT fk_doctors_department 
        FOREIGN KEY (department_id) REFERENCES departments(id);
    END IF;
END $$;

-- Note: We keep the old department column for now to maintain backward compatibility
-- It can be dropped later after verifying all data is migrated

