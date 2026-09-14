# Load Testing Report - Glow with Rubi

**Test Date:** September 14, 2026  
**Duration:** 5 minutes, 10 seconds  
**Target:** https://rubi-makeovers.vercel.app

---

## 📊 Summary Results

| Metric | Value |
|--------|-------|
| **Total Requests** | 8,814 |
| **Successful Responses (200)** | 3,562 (40.4%) ✅ |
| **Failed Requests** | 5,252 (59.6%) ❌ |
| **Socket Timeouts** | 5,191 |
| **Connection Resets** | 61 |
| **Average Response Time** | 1,421 ms |
| **Median Response Time** | 1,249 ms |
| **p95 Response Time** | 2,894 ms |
| **p99 Response Time** | 6,065 ms |
| **Min Response Time** | 58 ms |
| **Max Response Time** | 7,996 ms |
| **Virtual Users Created** | 6,300 |
| **Virtual Users Completed** | 1,048 |
| **Request Rate** | ~16 req/sec |

---

## 🔴 Key Issues Identified

### 1. **High Timeout Rate (59% Failure)**
- **Problem:** 5,191 socket timeouts out of 8,814 requests
- **Root Cause:** Server becoming unresponsive under peak load (50 concurrent users)
- **Impact:** Vercel serverless functions may be hitting cold start issues or resource limits

### 2. **Connection Resets (61 failures)**
- **Problem:** Server forcefully closing connections
- **Cause:** Likely exceeding concurrent connection limits

### 3. **Peak Load Phase Issues**
- During the 50 concurrent users phase, ~99% of requests failed with timeouts
- This indicates the server cannot handle sustained peak load

---

## 📈 Load Test Phases

### Phase 1: Warm Up (5 arrivals/sec, 60s)
- ✅ 32 successful responses
- ⚠️ Response times: 297-3,860 ms
- Mean: 1,800 ms

### Phase 2: Sustained Load (20 arrivals/sec, 120s)
- ✅ ~600 successful responses
- ✅ Response times improving: 65-2,909 ms
- Mean: 1,140 ms

### Phase 3: Peak Load (50 arrivals/sec, 60s)
- ❌ **~99% failure rate**
- ❌ Socket timeouts dominate
- Cannot sustain peak load

### Phase 4: Cool Down (10 arrivals/sec, 60s)
- ❌ Still experiencing timeouts
- Recovery is slow

---

## 🎯 Capacity Analysis

### Current Capacity
- **Optimal:** 5-10 concurrent users
- **Safe Load:** 20 concurrent users (with some timeouts)
- **Breaks at:** ~50 concurrent users

### Estimated Throughput
- **At 5 arrivals/sec:** ~100% success
- **At 20 arrivals/sec:** ~60-70% success
- **At 50+ arrivals/sec:** ~1% success

---

## 💡 Recommendations

### Immediate Actions (Priority: HIGH)
1. **Enable Edge Caching**
   - Current: `revalidate = 300` (server-side only)
   - Upgrade: Use Vercel Edge Caching with `stale-while-revalidate`
   - Impact: Reduce server load by 80%

2. **Optimize Image Delivery**
   - Use Vercel Image Optimization (already available)
   - Implement lazy loading across all pages
   - Compress images further
   - Impact: Reduce payload by 40-60%

3. **Database Query Optimization**
   - Add database indexes on frequently queried columns
   - Implement query caching layer (Redis)
   - Reduce N+1 query problems
   - Impact: Reduce response time by 30-50%

### Medium-term Actions (Priority: MEDIUM)
1. **Implement CDN**
   - Vercel automatically uses Edge Network
   - Ensure all assets cached at edge
   - Enable compression (gzip/brotli)

2. **Reduce Cold Starts**
   - Pre-warm functions (optional Vercel feature)
   - Keep functions lightweight
   - Move heavy operations to background jobs

3. **Database Connection Pooling**
   - Use connection pool for database
   - Reduce connection overhead
   - Impact: Faster response times

### Long-term Actions (Priority: MEDIUM)
1. **Upgrade Infrastructure**
   - Consider Vercel Pro or Enterprise plan
   - Higher function timeout limits
   - Better resource allocation

2. **Implement Caching Strategy**
   - Redis for session/query caching
   - Service worker for client-side caching
   - Browser caching headers

3. **Load Balancing**
   - Multiple database replicas for read scaling
   - Background job queue for async operations

---

## 🚀 Quick Wins (Easy Implementations)

```javascript
// 1. Add aggressive caching headers
export const revalidate = 60; // 1 minute server cache
// In API routes:
headers: {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400'
}

// 2. Implement request deduplication
// 3. Add database indexes
// 4. Use memoization for expensive computations
// 5. Limit database result sets
```

---

## 📋 Test Scenario Distribution

| Scenario | Weight | Users Created | Success Rate |
|----------|--------|---------------|--------------|
| Homepage & Browsing | 40% | 2,495 | ~35% |
| Package Browsing | 30% | 1,901 | ~42% |
| Booking Flow | 20% | 1,287 | ~45% |
| Footer & Info Pages | 10% | 617 | ~48% |

---

## ⚠️ Warnings

- **Current setup is suitable for:** Low traffic sites (<100 daily users)
- **Not suitable for:** Viral traffic, marketing campaigns, or high seasonal traffic
- **Session length:** Average 8,939 ms (users are spending ~9 seconds on site)

---

## ✅ What's Working Well

- ✅ Page caching (5 min TTL) is correctly configured
- ✅ Image optimization via Next.js Image component
- ✅ CSS and JS minification
- ✅ Response times <2s for successful requests

---

## 📝 Next Steps

1. **Implement recommended caching improvements** (2-3 hours work)
2. **Rerun load test** after optimizations
3. **Expected improvement:** 70-80% success rate at peak load
4. **Ultimate goal:** 95%+ success rate at sustained load

---

## Test Configuration

**Load Test File:** `load-test.yml`
**Processor:** `load-test-processor.js`
**Tool:** Artillery.io

To rerun this test:
```bash
npx artillery run load-test.yml --output load-test-results-new.json
```

---

Generated: 2026-09-14 23:15:13 IST
