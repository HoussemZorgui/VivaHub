// MongoDB initialization script
db = db.getSiblingDB('lifehub');

// Create collections
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('posts');
db.createCollection('messages');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.tasks.createIndex({ userId: 1, status: 1 });
db.posts.createIndex({ userId: 1, createdAt: -1 });
db.messages.createIndex({ conversationId: 1, createdAt: 1 });

print('MongoDB initialized successfully for LifeHub');
