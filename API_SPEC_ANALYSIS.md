# API Request Analysis: Product Creation Endpoint

## Expected Schema (from Frontend)

Based on the TypeScript types in `apps/web/src/lib/api/types.ts`, the expected `Product` interface is:

```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  metalType: "gold" | "silver";
  category: string;
  subCategory?: string;
  weight: number;
  purity: string;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  photos: string[];
  certificate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Endpoint Details
- **Method:** POST
- **URL:** `POST /api/admin/products/`
- **Content-Type:** `application/json`
- **Response Type:** `BaseResponse<Product>`

---

## Request 1: JSON Payload (Your First Curl)

### Request
```json
{
  "name": "Rring",
  "description": "This is a diamond ring",
  "sku": "SKU-001234",
  "price": 1000,
  "metalType": "gold",
  "category": "Rings",
  "subCategory": "",
  "weight": 100,
  "purity": "999",
  "stock": 9,
  "status": "active",
  "photos": [],
  "certificate": ""
}
```

### Content-Type
`application/json`

### ✅ Specification Compliance

| Field | Expected | Provided | Status |
|-------|----------|----------|--------|
| name | string (required) | "Rring" | ✅ MATCH |
| description | string (required) | "This is a diamond ring" | ✅ MATCH |
| sku | string (required) | "SKU-001234" | ✅ MATCH |
| price | number (required) | 1000 | ✅ MATCH |
| metalType | "gold" \| "silver" (required) | "gold" | ✅ MATCH |
| category | string (required) | "Rings" | ✅ MATCH |
| subCategory | string (optional) | "" | ✅ MATCH |
| weight | number (required) | 100 | ✅ MATCH |
| purity | string (required) | "999" | ✅ MATCH |
| stock | number (required) | 9 | ✅ MATCH |
| status | "active" \| "inactive" \| "out_of_stock" | "active" | ✅ MATCH |
| photos | string[] (required) | [] | ✅ MATCH |
| certificate | string (optional) | "" | ✅ MATCH |

### Issue: 422 Unprocessable Entity

**Possible Causes:**
1. ⚠️ Backend validation is stricter than TypeScript definition
2. ⚠️ `subCategory` validation - empty string might not be accepted (should be null/omitted)
3. ⚠️ `certificate` validation - empty string might not be accepted (should be null/omitted)
4. ⚠️ Server-side schema validation failing on empty string values
5. ⚠️ Missing required fields that aren't in frontend schema (backend has additional fields)

**Recommended Fix for Request 1:**
```bash
curl 'http://localhost:8000/api/admin/products/' \
  -X POST \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "name": "Rring",
    "description": "This is a diamond ring",
    "sku": "SKU-001234",
    "price": 1000,
    "metalType": "gold",
    "category": "Rings",
    "weight": 100,
    "purity": "999",
    "stock": 9,
    "status": "active",
    "photos": []
  }'
```
_Removed empty subCategory and certificate fields_

---

## Request 2: Multipart Form Data (Your Second Curl)

### Request
```
Content-Type: multipart/form-data
Fields:
- name= (empty)
- price=1
- grams=1
- category= (empty)
- photos=@filename
- discount_percentage=0
- discount_type=overall
- product_code= (empty)
- metal_purity= (empty)
- metal_type= (empty)
- gross_weight=0
- net_weight=0
- stone_weight=0
- making_charge=0
- gst=0
- quantity=0
- certificate=@filename
```

### ❌ Specification Compliance

| Field | Expected | Provided | Status |
|-------|----------|----------|--------|
| name | string (required) | "" (EMPTY) | ❌ **FAIL** |
| price | number (required) | 1 | ✅ MATCH |
| metalType | "gold" \| "silver" | "metal_type=" (EMPTY) | ❌ **FAIL** |
| category | string (required) | "" (EMPTY) | ❌ **FAIL** |
| weight | number (required) | **NOT PROVIDED** | ❌ **FAIL** |
| purity | string (required) | "metal_purity=" (EMPTY) | ❌ **FAIL** |
| stock | number (required) | "quantity"=0 | ⚠️ FIELD NAME MISMATCH |
| status | "active" \| "inactive" \| "out_of_stock" | **NOT PROVIDED** | ❌ **FAIL** |
| sku | string (required) | "product_code=" (EMPTY) | ⚠️ FIELD NAME MISMATCH + EMPTY |
| photos | string[] (required) | @filename | ⚠️ MULTIPART (not JSON array) |
| certificate | string (optional) | @filename | ⚠️ MULTIPART (not JSON string) |

### 🚨 Major Issues with Request 2

1. **Wrong Content-Type:** Uses `multipart/form-data` instead of `application/json`
   - Frontend API expects JSON
   - Backend will reject multipart for this endpoint

2. **Field Name Mismatches:**
   - `product_code` ≠ `sku`
   - `metal_type` ≠ `metalType`
   - `metal_purity` ≠ `purity`
   - `grams` - not in schema
   - `gross_weight`, `net_weight`, `stone_weight` - not in schema
   - `making_charge`, `gst`, `discount_percentage`, `discount_type` - not in schema

3. **Empty Required Fields:**
   - `name` is empty
   - `category` is empty
   - `metal_type` is empty
   - `metal_purity` is empty
   - `product_code` is empty

4. **File Uploads:**
   - `photos` and `certificate` as multipart file uploads
   - API expects string arrays/strings (URLs or base64)
   - Multipart handling not supported by current endpoint

---

## Correct Request Format

### ✅ Correct Curl (JSON format)
```bash
curl 'http://localhost:8000/api/admin/products/' \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  --cookie "sAccessToken=YOUR_JWT_TOKEN; sFrontToken=YOUR_FRONT_TOKEN" \
  --data-raw '{
    "name": "Diamond Ring",
    "description": "This is a diamond ring",
    "sku": "SKU-001234",
    "price": 1000,
    "metalType": "gold",
    "category": "Rings",
    "subCategory": "Engagement",
    "weight": 100,
    "purity": "999",
    "stock": 9,
    "status": "active",
    "photos": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ],
    "certificate": "https://example.com/certificate.pdf"
  }'
```

### Key Requirements
1. ✅ Content-Type: `application/json`
2. ✅ All required fields present and non-empty
3. ✅ Correct field names (camelCase)
4. ✅ Correct value types
5. ✅ Valid enum values
6. ✅ Authentication headers/cookies

---

## Why Request 1 Got 422

Without seeing the backend error message, the most likely causes are:

1. **Empty String Validation** - Backend rejects empty strings for optional fields
   - Solution: Remove `subCategory` and `certificate` from payload

2. **Backend Schema Differences** - Backend might require additional fields not in frontend types
   - Solution: Check backend API documentation or server logs

3. **Invalid Status Validation** - Backend might not recognize "active" status
   - Solution: Try "ACTIVE" (uppercase) or check valid statuses

4. **Authentication Issue** - Request might not have valid auth tokens
   - Solution: Verify JWT tokens are valid and included

5. **Price Validation** - Backend might require minimum price or specific format
   - Solution: Ensure price > 0 and is numeric

---

## Recommendations

### 1. Don't Use Request 2 (Multipart)
- ❌ Wrong content type
- ❌ Wrong field names
- ❌ Empty required fields
- ❌ Not supported by current API

### 2. Debug Request 1
To get the actual error, inspect the response body:
```bash
curl -v 'http://localhost:8000/api/admin/products/' \
  -X POST \
  -H 'Content-Type: application/json' \
  --data-raw '{"name":"Rring","description":"This is a diamond ring","sku":"SKU-001234","price":1000,"metalType":"gold","category":"Rings","weight":100,"purity":"999","stock":9,"status":"active","photos":[]}' \
  -w '\nHTTP Status: %{http_code}\n'
```

The response body should contain error details explaining why it's unprocessable.

### 3. Verify Backend Requirements
The 422 error means validation failed. Check:
- Backend server logs for detailed error message
- POST `/api/admin/products/` handler implementation
- Any additional validation rules not in frontend types

---

## Summary Table

| Aspect | Request 1 (JSON) | Request 2 (Multipart) |
|--------|-----------------|----------------------|
| Content-Type | ✅ Correct | ❌ Wrong |
| Field Names | ✅ Correct | ❌ Wrong |
| Field Values | ⚠️ Some empty | ❌ Many empty |
| Schema Match | ⚠️ Mostly correct | ❌ Mismatched |
| Authentication | ✅ Included | ✅ Included |
| Likely to Work | ⚠️ With fixes | ❌ Never |

**Verdict:** Request 1 is the correct approach but needs the empty string fields removed. Request 2 should not be used for this endpoint.
