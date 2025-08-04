package redis

import (
	"context"
	"time"

	"chatelly-backend/internal/config"

	"github.com/go-redis/redis/v8"
)

var Client *redis.Client

// Connect initializes Redis connection
func Connect(cfg *config.Config) error {
	Client = redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Host + ":" + cfg.Redis.Port,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Client.Ping(ctx).Result()
	if err != nil {
		return err
	}

	return nil
}

// Close closes Redis connection
func Close() error {
	if Client != nil {
		return Client.Close()
	}
	return nil
}

// Set sets a key-value pair with expiration
func Set(key string, value interface{}, expiration time.Duration) error {
	ctx := context.Background()
	return Client.Set(ctx, key, value, expiration).Err()
}

// Get gets a value by key
func Get(key string) (string, error) {
	ctx := context.Background()
	return Client.Get(ctx, key).Result()
}

// Incr increments a key
func Incr(key string) (int64, error) {
	ctx := context.Background()
	return Client.Incr(ctx, key).Result()
}

// Expire sets expiration for a key
func Expire(key string, expiration time.Duration) error {
	ctx := context.Background()
	return Client.Expire(ctx, key, expiration).Err()
}

// Del deletes keys
func Del(keys ...string) error {
	ctx := context.Background()
	return Client.Del(ctx, keys...).Err()
}

// Exists checks if key exists
func Exists(key string) (bool, error) {
	ctx := context.Background()
	result, err := Client.Exists(ctx, key).Result()
	return result > 0, err
}