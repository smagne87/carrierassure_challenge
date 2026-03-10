// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create MongoDB initialization script to set up database and indexes"
// Modifications: Added strategic indexes for carrier collection
// --- END AI-ASSISTED ---

// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the carrier-scoring database
db = db.getSiblingDB('carrier-scoring');

// Create carriers collection if it doesn't exist
db.createCollection('carriers');

// Create strategic indexes
print('Creating indexes for carriers collection...');

// 1. Unique index on carrier_id (primary lookup key)
db.carriers.createIndex({ carrier_id: 1 }, { unique: true, name: 'idx_carrier_id' });
print('✓ Created unique index on carrier_id');

// 2. Index on current_hash (critical for hash-based change detection)
db.carriers.createIndex({ current_hash: 1 }, { name: 'idx_current_hash' });
print('✓ Created index on current_hash');

// 3. Index on current_score.total descending (for sorted queries)
db.carriers.createIndex({ 'current_score.total': -1 }, { name: 'idx_score_desc' });
print('✓ Created descending index on current_score.total');

// 4. Index on dot_number (secondary lookup key)
db.carriers.createIndex({ dot_number: 1 }, { name: 'idx_dot_number' });
print('✓ Created index on dot_number');

// 5. Compound index for filtered queries (minScore + sorting)
db.carriers.createIndex(
  { 'current_score.total': -1, carrier_id: 1 },
  { name: 'idx_score_carrier' }
);
print('✓ Created compound index on score + carrier_id');

print('\n✓ MongoDB initialization complete!');
print('Database: carrier-scoring');
print('Indexes created: 5');
